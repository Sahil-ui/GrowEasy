import pLimit from 'p-limit';
import { BatchResult, CRMRecord, LLMProvider, RawRecord, SkippedRecord } from '../types';
import config from '../config';
import logger from '../logger';
import { LLMProviderFactory } from './providers';
import systemPromptV1 from '../prompts/v1/systemPrompt';
import createUserPromptV1 from '../prompts/v1/userPrompt';
import { extractJSON } from '../utils/jsonUtils';
import { validateAndNormalizeResponse } from '../validators/responseValidator';

export class BatchService {
  /**
   * Dynamically calculates batch size based on row count as per adaptive batch strategy.
   */
  public static calculateBatchSize(totalRows: number): number {
    if (totalRows < 100) {
      return 10;
    } else if (totalRows <= 1000) {
      return 20;
    } else {
      return config.defaultBatchSize || 50;
    }
  }

  /**
   * Splits raw records list into dynamic batches.
   */
  public static chunkRecords(records: RawRecord[], batchSize: number): RawRecord[][] {
    const chunks: RawRecord[][] = [];
    for (let i = 0; i < records.length; i += batchSize) {
      chunks.push(records.slice(i, i + batchSize));
    }
    return chunks;
  }

  /**
   * Processes all batches concurrently up to max limit.
   */
  public static async processAllBatches(
    records: RawRecord[],
    headers: string[]
  ): Promise<BatchResult[]> {
    const batchSize = this.calculateBatchSize(records.length);
    const chunks = this.chunkRecords(records, batchSize);
    
    logger.info(
      `Starting adaptive batching: total rows=${records.length}, batch size=${batchSize}, total batches=${chunks.length}`
    );

    const provider = LLMProviderFactory.getProvider();
    
    // Concurrency limit from config
    const limit = pLimit(config.maxConcurrentBatches);

    const promises = chunks.map((chunk, index) => {
      const offset = index * batchSize;
      return limit(() => this.processBatchWithRetry(provider, chunk, headers, index, offset));
    });

    const results = await Promise.all(promises);
    return results;
  }

  /**
   * Sends a batch to the LLM and runs parsing & validation with a retry loop.
   */
  private static async processBatchWithRetry(
    provider: LLMProvider,
    chunk: RawRecord[],
    headers: string[],
    batchIndex: number,
    offset: number,
    retryCount: number = 0
  ): Promise<BatchResult> {
    try {
      logger.info(`Processing Batch ${batchIndex + 1}: offset=${offset}, size=${chunk.length}`);
      
      const systemPrompt = systemPromptV1;
      const userPrompt = createUserPromptV1(chunk, headers);

      // Call LLM
      const rawResponse = await provider.extractBatch(systemPrompt, userPrompt);

      // Parse JSON from text response
      const extractedArray = extractJSON<any[]>(rawResponse);

      if (!Array.isArray(extractedArray)) {
        throw new Error('LLM output parsed successfully but is not a JSON array');
      }

      // Validate schema and normalize fields
      const { validRecords, skippedRecords } = validateAndNormalizeResponse(
        extractedArray,
        chunk,
        offset
      );

      logger.info(
        `Batch ${batchIndex + 1} processed successfully: ${validRecords.length} imported, ${skippedRecords.length} skipped`
      );

      return {
        batchIndex,
        success: true,
        records: validRecords,
        skippedRecords,
      };
    } catch (error: any) {
      const triesRemaining = config.maxRetries - retryCount;
      
      logger.warn(
        `Batch ${batchIndex + 1} failed on try ${retryCount + 1}. Error: ${error.message}. Tries remaining: ${triesRemaining}`
      );

      if (triesRemaining > 0) {
        // Calculate backoff: base * 2^retry
        const delay = config.retryBaseDelayMs * Math.pow(2, retryCount);
        logger.info(`Sleeping for ${delay}ms before retrying Batch ${batchIndex + 1}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return this.processBatchWithRetry(provider, chunk, headers, batchIndex, offset, retryCount + 1);
      }

      // All retries exhausted: mark batch as failed
      logger.error(`Batch ${batchIndex + 1} failed permanently after ${config.maxRetries} retries: ${error.message}`);
      
      // Map all records in this batch to skipped list with failure reason
      const skippedRecords: SkippedRecord[] = chunk.map((record, index) => ({
        originalRow: offset + index + 1,
        originalData: record,
        reason: `AI processing error after multiple retries: ${error.message}`,
      }));

      return {
        batchIndex,
        success: false,
        records: [],
        skippedRecords,
        error: error.message,
      };
    }
  }
}

export default BatchService;

import { CSVService } from './csvService';
import { BatchService } from './batchService';
import { validateCSV } from '../validators/csvValidator';
import { CRMRecord, ImportResponseData, SkippedRecord } from '../types';
import logger from '../logger';
import { AppError } from '../middleware/errorHandler';

export class ExtractionService {
  /**
   * Orchestrates the complete CSV AI-extraction pipeline.
   * Parses CSV, runs validators, batches records to the LLM, normalizes, and aggregates responses.
   */
  public static async run(fileBuffer: Buffer): Promise<ImportResponseData> {
    logger.info('Starting lead extraction pipeline');

    // 1. Parse CSV File
    const parsedData = CSVService.parse(fileBuffer);
    const { headers, records, totalRows } = parsedData;

    // 2. Validate CSV layout/records
    validateCSV(headers, records);

    // 3. Process batches concurrently with retries
    const batchResults = await BatchService.processAllBatches(records, headers);

    // 4. Aggregate results
    const finalRecords: CRMRecord[] = [];
    const finalSkipped: SkippedRecord[] = [];
    let failedBatchCount = 0;

    batchResults.forEach((result) => {
      if (!result.success) {
        failedBatchCount++;
      }
      finalRecords.push(...result.records);
      finalSkipped.push(...result.skippedRecords);
    });

    if (failedBatchCount === batchResults.length && totalRows > 0) {
      throw new AppError(
        'All AI extraction batches failed permanently. Check API keys and network status.',
        502,
        'ALL_BATCHES_FAILED'
      );
    }

    logger.info(
      `Extraction pipeline complete: totalRows=${totalRows}, successfullyImported=${finalRecords.length}, skippedCount=${finalSkipped.length}`
    );

    return {
      totalRecords: totalRows,
      importedCount: finalRecords.length,
      skippedCount: finalSkipped.length,
      records: finalRecords,
      skippedRecords: finalSkipped.sort((a, b) => a.originalRow - b.originalRow),
    };
  }
}

export default ExtractionService;

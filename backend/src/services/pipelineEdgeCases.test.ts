import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateFile } from '../validators/fileValidator';
import { CSVService } from './csvService';
import { BatchService } from './batchService';
import { ExtractionService } from './extractionService';
import { LLMProviderFactory } from './providers';
import { AppError } from '../middleware/errorHandler';
import { LLMProvider } from '../types';
import config from '../config';

// Mock LLM Provider Factory
vi.mock('./providers', () => {
  const mockProvider: LLMProvider = {
    extractBatch: vi.fn(),
  };
  return {
    LLMProviderFactory: {
      getProvider: () => mockProvider,
    },
  };
});

describe('Pipeline Edge Cases & Resilience Tests', () => {
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = LLMProviderFactory.getProvider();
    vi.clearAllMocks();
    
    // Override delay configurations to keep tests fast
    config.retryBaseDelayMs = 1;
    config.maxRetries = 3;
  });

  // ─── 1. File & CSV Validation Edge Cases ───────────────────────────────────

  it('should throw an error for empty file uploads', () => {
    const emptyFile = {
      fieldname: 'file',
      originalname: 'empty.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: Buffer.from(''),
      size: 0,
    } as Express.Multer.File;

    expect(() => validateFile(emptyFile)).toThrowError(
      expect.objectContaining({
        code: 'EMPTY_FILE',
        statusCode: 400,
      })
    );
  });

  it('should throw an error for invalid file extensions', () => {
    const txtFile = {
      fieldname: 'file',
      originalname: 'leads.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      buffer: Buffer.from('some text content'),
      size: 17,
    } as Express.Multer.File;

    expect(() => validateFile(txtFile)).toThrowError(
      expect.objectContaining({
        code: 'INVALID_FILE_EXTENSION',
        statusCode: 400,
      })
    );
  });

  it('should throw a critical parse error if no columns/headers are found in CSV', () => {
    const csvBuffer = Buffer.from('\n\n\n');
    expect(() => CSVService.parse(csvBuffer)).toThrowError(
      expect.objectContaining({
        code: 'CSV_PARSE_CRITICAL_ERROR',
        statusCode: 422,
      })
    );
  });

  // ─── 2. Adaptive Batch Sizing ──────────────────────────────────────────────

  it('should apply correct batch sizes based on row count thresholds', () => {
    // Under 100 rows -> 10 records per batch
    expect(BatchService.calculateBatchSize(50)).toBe(10);
    expect(BatchService.calculateBatchSize(99)).toBe(10);

    // 100 to 1000 rows -> 20 records per batch
    expect(BatchService.calculateBatchSize(100)).toBe(20);
    expect(BatchService.calculateBatchSize(500)).toBe(20);
    expect(BatchService.calculateBatchSize(1000)).toBe(20);

    // >1000 rows -> defaults to config value (10 in test settings)
    config.defaultBatchSize = 10;
    expect(BatchService.calculateBatchSize(1001)).toBe(10); 
  });

  // ─── 3. Network Failures & Retry Logic ─────────────────────────────────────

  it('should succeed after retrying on transient network failures', async () => {
    const csvBuffer = Buffer.from(
      `Name,Email,Phone\nJohn Doe,john@example.com,9876543210`
    );

    const mockAIResponse = JSON.stringify([
      {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_without_country_code: '9876543210',
      },
    ]);

    // Setup Mock Provider to fail twice with a network exception, then succeed
    mockProvider.extractBatch
      .mockRejectedValueOnce(new Error('Network Timeout'))
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValueOnce(mockAIResponse);

    const results = await ExtractionService.run(csvBuffer);

    expect(results.importedCount).toBe(1);
    expect(results.skippedCount).toBe(0);
    expect(mockProvider.extractBatch).toHaveBeenCalledTimes(3);
  });

  it('should throw an AppError if AI fails permanently on all batches after maximum retries', async () => {
    const csvBuffer = Buffer.from(
      `Name,Email,Phone\nJohn Doe,john@example.com,9876543210\nJane Smith,jane@example.com,9876543211`
    );

    // Mock provider to fail permanently on every try
    mockProvider.extractBatch.mockRejectedValue(new Error('Quota exceeded'));

    await expect(ExtractionService.run(csvBuffer)).rejects.toThrowError(
      expect.objectContaining({
        code: 'ALL_BATCHES_FAILED',
        statusCode: 502,
      })
    );
  });

  // ─── 4. Missing Columns & Skip Rules ───────────────────────────────────────

  it('should map missing columns as null and skip rows without contact information', async () => {
    const csvBuffer = Buffer.from(
      `FullName,City\n` +
      `No Contact Info,Paris\n`
    );

    const mockAIResponse = JSON.stringify([
      {
        name: 'No Contact Info',
        city: 'Paris',
        email: null,
        mobile_without_country_code: null,
      },
    ]);

    mockProvider.extractBatch.mockResolvedValueOnce(mockAIResponse);

    const results = await ExtractionService.run(csvBuffer);

    expect(results.totalRecords).toBe(1);
    expect(results.importedCount).toBe(0);
    expect(results.skippedCount).toBe(1);
    expect(results.skippedRecords[0].reason).toBe(
      'Record contains neither a valid email nor a mobile phone number.'
    );
  });
});

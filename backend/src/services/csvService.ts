import Papa from 'papaparse';
import { ParsedCSV, RawRecord } from '../types';
import { AppError } from '../middleware/errorHandler';
import logger from '../logger';

/**
 * Service to parse raw CSV file data.
 */
export class CSVService {
  /**
   * Parses raw CSV string or buffer into clean list of headers and records.
   * Leverages PapaParse for auto-detecting delimiters, quotes, and encodings.
   */
  public static parse(buffer: Buffer): ParsedCSV {
    try {
      // Convert buffer to string, stripping BOM if present
      let csvContent = buffer.toString('utf-8');
      if (csvContent.charCodeAt(0) === 0xfeff) {
        csvContent = csvContent.substring(1);
      }

      logger.debug('Starting CSV parsing via PapaParse');

      const result = Papa.parse(csvContent, {
        header: true, // Auto-map columns into key-value records
        skipEmptyLines: 'greedy', // Skip completely empty lines
        dynamicTyping: false, // Keep values as strings for LLM handling
      });

      if (result.errors && result.errors.length > 0) {
        // Log errors, but only throw if parsing failed entirely
        logger.warn('PapaParse encountered errors during parse:', result.errors);
        
        // Critical error check
        const criticalError = result.errors.find(
          (err) => err.code === 'UndetectableDelimiter' || err.code === 'TooManyFields'
        );
        if (criticalError) {
          throw new AppError(
            `Failed to parse CSV: ${criticalError.message}`,
            422,
            'CSV_PARSE_CRITICAL_ERROR'
          );
        }
      }

      const headers = result.meta.fields || [];
      const records = result.data as RawRecord[];

      logger.info(`CSV parsed successfully: ${headers.length} headers, ${records.length} records found`);

      return {
        headers,
        records,
        totalRows: records.length,
      };
    } catch (error: any) {
      logger.error('CSV Parsing failed:', { error: error.message || error });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Unable to parse CSV. Please check the file formatting. Internal error: ${error.message}`,
        422,
        'CSV_PARSE_FAILED'
      );
    }
  }
}

export default CSVService;

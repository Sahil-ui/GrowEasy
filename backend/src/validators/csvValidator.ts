import { AppError } from '../middleware/errorHandler';
import { RawRecord } from '../types';

/**
 * Validates parsed CSV data structure.
 * Checks for presence of headers and at least one valid row of data.
 */
export const validateCSV = (headers: string[], records: RawRecord[]): void => {
  if (!headers || headers.length === 0) {
    throw new AppError('No columns found in the CSV file.', 400, 'INVALID_CSV_HEADERS');
  }

  // Filter out headers that are empty or whitespace
  const cleanHeaders = headers.map((h) => h.trim()).filter(Boolean);
  if (cleanHeaders.length === 0) {
    throw new AppError('CSV file does not contain any valid column names.', 400, 'EMPTY_CSV_HEADERS');
  }

  if (!records || records.length === 0) {
    throw new AppError('CSV file does not contain any data rows.', 400, 'EMPTY_CSV_ROWS');
  }

  // Check if all rows are completely empty
  const hasData = records.some((record) => {
    return Object.values(record).some((val) => val && val.trim().length > 0);
  });

  if (!hasData) {
    throw new AppError('CSV file contains only empty data rows.', 400, 'EMPTY_CSV_DATA');
  }
};

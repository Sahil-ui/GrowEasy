import Papa from 'papaparse';
import { ParsedCSV } from '../types';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationError {
  code: string;
  message: string;
}

/** Validates the file before parsing */
export const validateFile = (file: File): FileValidationError | null => {
  if (!file) return { code: 'NO_FILE', message: 'No file selected.' };

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'csv') {
    return { code: 'INVALID_EXT', message: 'Please upload a .csv file.' };
  }

  if (file.size === 0) {
    return { code: 'EMPTY_FILE', message: 'The file is empty.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { code: 'FILE_TOO_LARGE', message: `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit.` };
  }

  return null;
};

/** Parses a CSV File object into structured headers + rows */
export const parseCSVFile = (file: File): Promise<ParsedCSV> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        if (headers.length === 0) {
          return reject(new Error('No column headers found in the CSV.'));
        }
        if (rows.length === 0) {
          return reject(new Error('No data rows found in the CSV.'));
        }

        resolve({ headers, rows, totalRows: rows.length });
      },
      error: (err) => {
        reject(new Error(`CSV parsing failed: ${err.message}`));
      },
    });
  });
};

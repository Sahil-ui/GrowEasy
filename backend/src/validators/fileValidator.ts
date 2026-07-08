import { AppError } from '../middleware/errorHandler';
import config from '../config';

/**
 * Validates the uploaded file.
 * Checks for presence, file extension, mime-type, and size limits.
 */
export const validateFile = (file?: Express.Multer.File): void => {
  if (!file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE_UPLOADED');
  }

  // Verify file size
  const maxBytes = config.maxUploadSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError(
      `File size exceeds the maximum limit of ${config.maxUploadSizeMB} MB.`,
      413,
      'FILE_TOO_LARGE'
    );
  }

  // Validate extension
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  if (extension !== 'csv') {
    throw new AppError(
      'Invalid file type. Only CSV files are accepted.',
      400,
      'INVALID_FILE_EXTENSION'
    );
  }

  // Validate MIME type
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain', // some systems export CSV as text/plain
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(
      `Invalid MIME type [${file.mimetype}]. Only CSV files are accepted.`,
      400,
      'INVALID_FILE_MIME'
    );
  }

  // Validate file content is not empty
  if (file.size === 0 || !file.buffer || file.buffer.length === 0) {
    throw new AppError('The uploaded file is empty.', 400, 'EMPTY_FILE');
  }
};

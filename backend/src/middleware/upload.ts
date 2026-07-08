import multer from 'multer';
import config from '../config';
import { AppError } from './errorHandler';

// Use memory storage to process CSV directly from buffer
const storage = multer.memoryStorage();

// Multer upload filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  
  if (extension !== 'csv') {
    return callback(
      new AppError('Only CSV files are accepted.', 400, 'INVALID_FILE_EXTENSION')
    );
  }
  
  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadSizeMB * 1024 * 1024, // in bytes
    files: 1, // only allow one file per request
  },
});

export default upload;

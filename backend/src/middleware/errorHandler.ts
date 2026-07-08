import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { APIErrorResponse } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Log error with full details
  logger.error(`${req.method} ${req.url} - Error: ${message}`, {
    stack: err.stack,
    statusCode,
    errorCode,
  });

  const responseBody: APIErrorResponse = {
    success: false,
    error: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : message,
    code: errorCode,
  };

  res.status(statusCode).json(responseBody);
};

import { Request, Response, NextFunction } from 'express';
import { validateFile } from '../validators/fileValidator';
import { ExtractionService } from '../services/extractionService';
import logger from '../logger';
import { APISuccessResponse } from '../types';

export class ImportController {
  /**
   * Controller to handle POST /api/import
   */
  public static async importCSV(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = req.file;

      logger.info('Received CSV import request');

      // 1. Validate file exists and matches requirements
      validateFile(file);

      // 2. Delegate to the Extraction service pipeline
      const data = await ExtractionService.run(file!.buffer);

      // 3. Format and send API response
      const responseBody: APISuccessResponse = {
        success: true,
        data,
      };

      res.status(200).json(responseBody);
    } catch (error) {
      // Delegate to global Express error handler
      next(error);
    }
  }
}

export default ImportController;

import { Router } from 'express';
import { ImportController } from '../controllers/importController';
import { upload } from '../middleware/upload';
import { importRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Endpoint accepting multipart CSV uploads
router.post('/', importRateLimiter, upload.single('file'), ImportController.importCSV);

export default router;

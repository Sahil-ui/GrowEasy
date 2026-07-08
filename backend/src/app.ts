import express from 'express';
import cors from 'cors';
import config from './config';
import logger from './logger';
import { errorHandler } from './middleware/errorHandler';
import { APISuccessResponse } from './types';

import importRoutes from './routes/importRoutes';

const app = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = config.allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin === '*') return true;
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    provider: config.llmProvider,
    model: config.aiModelName,
  });
});

// Setup root fallback route
app.use('/api/import', importRoutes);

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Listen on configured port if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`GrowEasy CSV Importer Server successfully started on port ${config.port}`);
    logger.info(`Running in [${config.nodeEnv}] mode using LLM provider [${config.llmProvider}]`);
  });
}

export default app;

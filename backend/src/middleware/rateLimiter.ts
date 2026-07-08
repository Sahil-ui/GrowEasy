import rateLimit from 'express-rate-limit';
import config from '../config';
import { APIErrorResponse } from '../types';

export const importRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP. Please wait before uploading another file.',
    code: 'RATE_LIMIT_EXCEEDED',
  } as APIErrorResponse,
  statusCode: 429,
});

export default importRateLimiter;

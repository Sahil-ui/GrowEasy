import dotenv from 'dotenv';
import path from 'path';
import { AppConfig, LLMProviderName } from '../types';

// Load environmental variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Configuration Error: Missing required environment variable [${key}]`);
  }
  return value;
};

const getEnvOrDefault = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const parseAllowedOrigins = (value: string): string[] => {
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const validateProvider = (value: string): LLMProviderName => {
  const providers: LLMProviderName[] = ['gemini', 'openai', 'claude'];
  if (!providers.includes(value as LLMProviderName)) {
    throw new Error(
      `Configuration Error: Invalid LLM_PROVIDER [${value}]. Allowed values are: ${providers.join(', ')}`
    );
  }
  return value as LLMProviderName;
};

export const loadConfig = (): AppConfig => {
  // Validate presence of API key
  const provider = validateProvider(getEnvOrDefault('LLM_PROVIDER', 'gemini'));
  const aiApiKey = getEnvOrThrow('AI_API_KEY');

  const config: AppConfig = {
    port: parseInt(getEnvOrDefault('PORT', '5000'), 10),
    nodeEnv: getEnvOrDefault('NODE_ENV', 'development'),
    allowedOrigins: parseAllowedOrigins(getEnvOrDefault('ALLOWED_ORIGINS', 'http://localhost:3000')),
    llmProvider: provider,
    aiApiKey,
    aiModelName: getEnvOrDefault(
      'AI_MODEL_NAME',
      provider === 'gemini' ? 'gemini-2.5-flash' : provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet'
    ),
    aiTemperature: parseFloat(getEnvOrDefault('AI_TEMPERATURE', '0')),
    aiMaxTokens: parseInt(getEnvOrDefault('AI_MAX_TOKENS', '4096'), 10),
    defaultBatchSize: parseInt(getEnvOrDefault('DEFAULT_BATCH_SIZE', '10'), 10),
    maxUploadSizeMB: parseInt(getEnvOrDefault('MAX_UPLOAD_SIZE_MB', '10'), 10),
    maxConcurrentBatches: parseInt(getEnvOrDefault('MAX_CONCURRENT_BATCHES', '3'), 10),
    maxRetries: parseInt(getEnvOrDefault('MAX_RETRIES', '3'), 10),
    retryBaseDelayMs: parseInt(getEnvOrDefault('RETRY_BASE_DELAY_MS', '1000'), 10),
    timeoutDurationMs: parseInt(getEnvOrDefault('TIMEOUT_DURATION_MS', '60000'), 10),
    rateLimitWindowMs: parseInt(getEnvOrDefault('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    rateLimitMaxRequests: parseInt(getEnvOrDefault('RATE_LIMIT_MAX_REQUESTS', '20'), 10),
    logLevel: getEnvOrDefault('LOG_LEVEL', 'info'),
  };

  return config;
};

// Singleton configuration instance
export const config = loadConfig();
export default config;

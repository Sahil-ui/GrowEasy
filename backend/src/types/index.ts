/**
 * Shared TypeScript types for the GrowEasy CSV Importer.
 * These define the CRM record schema, API contracts, and internal data shapes.
 */

// ─── CRM Record Types ────────────────────────────────────────────────────────

/** Allowed values for crm_status */
export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

/** Allowed values for data_source */
export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

/** A single CRM record extracted by the AI */
export interface CRMRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CRMStatus | null;
  crm_note: string | null;
  data_source: DataSource | null;
  possession_time: string | null;
  description: string | null;
}

/** All 15 CRM field names */
export const CRM_FIELD_NAMES: (keyof CRMRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

// ─── API Response Types ──────────────────────────────────────────────────────

/** A skipped record with reason */
export interface SkippedRecord {
  originalRow: number;
  originalData: Record<string, string>;
  reason: string;
}

/** Successful import response data */
export interface ImportResponseData {
  totalRecords: number;
  importedCount: number;
  skippedCount: number;
  records: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

/** Standard API success response */
export interface APISuccessResponse {
  success: true;
  data: ImportResponseData;
}

/** Standard API error response */
export interface APIErrorResponse {
  success: false;
  error: string;
  code: string;
}

/** Union type for all API responses */
export type APIResponse = APISuccessResponse | APIErrorResponse;

// ─── Internal Pipeline Types ─────────────────────────────────────────────────

/** A raw CSV row parsed into key-value pairs */
export type RawRecord = Record<string, string>;

/** A batch of raw records with metadata */
export interface RecordBatch {
  batchIndex: number;
  records: RawRecord[];
  headers: string[];
}

/** Result of processing a single batch */
export interface BatchResult {
  batchIndex: number;
  success: boolean;
  records: CRMRecord[];
  skippedRecords: SkippedRecord[];
  error?: string;
}

/** Parsed CSV result from the CSV service */
export interface ParsedCSV {
  headers: string[];
  records: RawRecord[];
  totalRows: number;
}

// ─── LLM Provider Types ─────────────────────────────────────────────────────

/** Interface that all LLM providers must implement */
export interface LLMProvider {
  /** Send a batch of records to the LLM and return the raw response string */
  extractBatch(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string>;
}

/** Supported LLM provider identifiers */
export type LLMProviderName = 'gemini' | 'openai' | 'claude';

// ─── Configuration Types ─────────────────────────────────────────────────────

export interface AppConfig {
  port: number;
  nodeEnv: string;
  allowedOrigins: string[];
  llmProvider: LLMProviderName;
  aiApiKey: string;
  aiModelName: string;
  aiTemperature: number;
  aiMaxTokens: number;
  defaultBatchSize: number;
  maxUploadSizeMB: number;
  maxConcurrentBatches: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  timeoutDurationMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
}

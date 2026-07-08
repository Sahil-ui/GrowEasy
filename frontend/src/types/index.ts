// ─── CRM Record Types ─────────────────────────────────────────────────────────

export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

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

export interface SkippedRecord {
  originalRow: number;
  originalData: Record<string, string>;
  reason: string;
}

export interface ImportResponseData {
  totalRecords: number;
  importedCount: number;
  skippedCount: number;
  records: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

export interface APISuccessResponse {
  success: true;
  data: ImportResponseData;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type APIResponse = APISuccessResponse | APIErrorResponse;

// ─── App State Machine ────────────────────────────────────────────────────────

export type AppStep = 'IDLE' | 'FILE_SELECTED' | 'PREVIEWING' | 'PROCESSING' | 'RESULTS' | 'ERROR';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface AppState {
  step: AppStep;
  file: File | null;
  parsedCSV: ParsedCSV | null;
  importResult: ImportResponseData | null;
  error: string | null;
  isProcessing: boolean;
}

export type AppAction =
  | { type: 'FILE_SELECTED'; payload: File }
  | { type: 'CSV_PARSED'; payload: ParsedCSV }
  | { type: 'PARSE_ERROR'; payload: string }
  | { type: 'IMPORT_START' }
  | { type: 'IMPORT_SUCCESS'; payload: ImportResponseData }
  | { type: 'IMPORT_ERROR'; payload: string }
  | { type: 'RESET' };

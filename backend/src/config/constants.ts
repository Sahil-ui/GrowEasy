import { CRMStatus, DataSource, CRMRecord } from '../types';

/** Valid status enum values */
export const ALLOWED_CRM_STATUSES: CRMStatus[] = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

/** Valid data source enum values */
export const ALLOWED_DATA_SOURCES: DataSource[] = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

/** Full list of CRM Fields with their semantic descriptions for prompt instruction */
export const CRM_FIELD_DESCRIPTIONS: Record<keyof CRMRecord, string> = {
  created_at: 'Lead creation date, normalized to standard ISO format parseable by JavaScript new Date().',
  name: 'Lead full name. If split into first/last name, concatenate them.',
  email: 'Primary email address. Normalize to lowercase.',
  country_code: 'Country dialing code (e.g. +91 or +1). Format with a leading plus (+) symbol.',
  mobile_without_country_code: 'Mobile phone number without dialing code. Strip spaces, dashes, and brackets.',
  company: 'Company/organization name.',
  city: 'City location.',
  state: 'State/region location.',
  country: 'Country name.',
  lead_owner: 'Email address of the assigned lead owner/agent.',
  crm_status: 'Lead status. Must match one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE.',
  crm_note: 'Aggregated overflow comments, remarks, additional phone numbers, secondary emails, and descriptive notes.',
  data_source: 'Allowed campaign/location identifiers. Must strictly match one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Otherwise set to null/blank.',
  possession_time: 'Property possession timeline or date mentioned in lead remarks.',
  description: 'General descriptive comments or notes about the lead.',
};

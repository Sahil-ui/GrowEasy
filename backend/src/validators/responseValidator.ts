import { z } from 'zod';
import { CRMRecord, CRMStatus, DataSource, RawRecord, SkippedRecord } from '../types';
import { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES } from '../config/constants';
import { normalizePhone } from '../utils/phoneUtils';
import { normalizeDate } from '../utils/dateUtils';
import logger from '../logger';

// Zod schema matching target CRM record fields
export const crmRecordSchema = z.object({
  created_at: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
  mobile_without_country_code: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  lead_owner: z.string().nullable().optional(),
  crm_status: z.enum(ALLOWED_CRM_STATUSES as [string, ...string[]]).nullable().optional(),
  crm_note: z.string().nullable().optional(),
  data_source: z.enum(ALLOWED_DATA_SOURCES as [string, ...string[]]).nullable().optional(),
  possession_time: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export interface ExtractionResult {
  validRecords: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

/**
 * Validates and normalizes raw AI-extracted objects against the CRM schema.
 * Performs date normalization, phone formatting, enum validation, hallucination checks, and skip checks.
 */
export const validateAndNormalizeResponse = (
  extractedArray: any[],
  originalBatchRecords: RawRecord[],
  batchOffset: number
): ExtractionResult => {
  const validRecords: CRMRecord[] = [];
  const skippedRecords: SkippedRecord[] = [];

  extractedArray.forEach((rawItem, index) => {
    const originalRowNumber = batchOffset + index + 1;
    const originalData = originalBatchRecords[index] || {};

    try {
      // 1. Zod schema validation (partial/loose validation)
      const parsedItem = crmRecordSchema.safeParse(rawItem);
      if (!parsedItem.success) {
        logger.warn(`Row ${originalRowNumber}: Zod validation warnings:`, parsedItem.error.format());
      }

      // Merge defaults for missing fields
      const data = { ...rawItem };

      // 2. Hallucination checks: Compare extracted emails and phones against original row contents
      if (data.email) {
        const emailStr = String(data.email).trim().toLowerCase();
        const originalValues = Object.values(originalData).map((val) => String(val).toLowerCase());
        const emailExistsInOriginal = originalValues.some((val) => val.includes(emailStr));

        if (!emailExistsInOriginal && emailStr.length > 0) {
          logger.warn(`Row ${originalRowNumber}: Hallucinated email detected [${emailStr}]. Discarding value.`);
          data.email = null;
        }
      }

      if (data.mobile_without_country_code) {
        const phoneStr = String(data.mobile_without_country_code).replace(/[^\d]/g, '');
        const originalDigits = Object.values(originalData).map((val) => String(val).replace(/[^\d]/g, ''));
        const phoneExistsInOriginal = originalDigits.some((val) => val.includes(phoneStr));

        if (!phoneExistsInOriginal && phoneStr.length > 0) {
          logger.warn(
            `Row ${originalRowNumber}: Hallucinated phone detected [${data.mobile_without_country_code}]. Discarding value.`
          );
          data.mobile_without_country_code = null;
        }
      }

      // 3. Normalization: Dates
      const normalizedCreatedAt = normalizeDate(data.created_at || null);
      data.created_at = normalizedCreatedAt;

      // 4. Normalization: Phone & Country Code
      const { countryCode, mobileNumber } = normalizePhone(
        data.mobile_without_country_code || null,
        data.country_code || null
      );
      data.country_code = countryCode;
      data.mobile_without_country_code = mobileNumber;

      // 5. Enforce enums (set to null if invalid)
      if (data.crm_status && !ALLOWED_CRM_STATUSES.includes(data.crm_status as CRMStatus)) {
        data.crm_status = null;
      }
      if (data.data_source && !ALLOWED_DATA_SOURCES.includes(data.data_source as DataSource)) {
        data.data_source = null;
      }

      // 6. Escape line breaks in notes
      if (data.crm_note) {
        data.crm_note = String(data.crm_note).replace(/\r?\n/g, '\\n');
      }

      // Trim all string properties
      Object.keys(data).forEach((key) => {
        const k = key as keyof CRMRecord;
        if (typeof data[k] === 'string') {
          data[k] = (data[k] as string).trim() || null;
        }
      });

      // 7. Skip logic check: Row must contain EITHER email OR mobile_without_country_code
      const hasEmail = data.email && data.email.trim().length > 0;
      const hasMobile = data.mobile_without_country_code && data.mobile_without_country_code.trim().length > 0;

      if (!hasEmail && !hasMobile) {
        skippedRecords.push({
          originalRow: originalRowNumber,
          originalData,
          reason: 'Record contains neither a valid email nor a mobile phone number.',
        });
      } else {
        // Construct final CRMRecord
        const record: CRMRecord = {
          created_at: data.created_at || null,
          name: data.name || null,
          email: data.email || null,
          country_code: data.country_code || null,
          mobile_without_country_code: data.mobile_without_country_code || null,
          company: data.company || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          lead_owner: data.lead_owner || null,
          crm_status: (data.crm_status as CRMStatus) || null,
          crm_note: data.crm_note || null,
          data_source: (data.data_source as DataSource) || null,
          possession_time: data.possession_time || null,
          description: data.description || null,
        };
        validRecords.push(record);
      }
    } catch (err: any) {
      logger.error(`Row ${originalRowNumber}: Error processing response validation: ${err.message}`);
      skippedRecords.push({
        originalRow: originalRowNumber,
        originalData,
        reason: `Internal validation failure: ${err.message}`,
      });
    }
  });

  return { validRecords, skippedRecords };
};

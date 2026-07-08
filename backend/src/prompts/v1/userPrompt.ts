import { RawRecord } from '../../types';

export const createUserPromptV1 = (records: RawRecord[], headers: string[]): string => {
  const payload = {
    metadata: {
      sourceHeaders: headers,
      rowCount: records.length,
    },
    rawRecords: records.map((record, index) => ({
      originalRowIndex: index + 1, // 1-indexed for logging/tracking
      data: record,
    })),
  };

  return `
Below is a batch of lead records containing arbitrary headers and values. 
Extract and map these records into the standard CRM schema according to the system instructions.

=== INPUT DATA ===
${JSON.stringify(payload, null, 2)}

=== RESPONSE REQUIREMENTS ===
Return a valid JSON array of ${records.length} objects matching the row order. 
Each object must contain all 15 schema keys. Fill empty fields with null. 
Do not include any text other than the JSON output.
`;
};

export default createUserPromptV1;

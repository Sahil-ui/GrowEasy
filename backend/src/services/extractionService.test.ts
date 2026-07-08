import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExtractionService } from './extractionService';
import { LLMProviderFactory } from './providers';
import { LLMProvider } from '../types';

// Mock LLM Provider Factory
vi.mock('./providers', () => {
  const mockProvider: LLMProvider = {
    extractBatch: vi.fn(),
  };
  return {
    LLMProviderFactory: {
      getProvider: () => mockProvider,
    },
  };
});

describe('ExtractionService Integration', () => {
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = LLMProviderFactory.getProvider();
    vi.clearAllMocks();
  });

  it('should orchestrate parsing, AI-extraction and validation flow', async () => {
    // 1. Prepare raw CSV contents
    const csvBuffer = Buffer.from(
      `Full Name,Email Address,Mobile,City,Status,Campaign\n` +
      `John Doe,john@example.com,9876543210,Mumbai,Good,Meridian Tower\n` +
      `Jane Smith,,+1 (555) 123-4567,Delhi,No Response,Eden Park\n` +
      `No Contact Info,test@test.com,,Bangalore,,leads_on_demand\n` +
      `Invalid Row,,,,,\n` // neither email nor phone
    );

    // 2. Prepare mock AI response
    const mockAIResponse = JSON.stringify([
      {
        created_at: '2026-07-07T12:00:00Z',
        name: 'John Doe',
        email: 'john@example.com',
        country_code: null,
        mobile_without_country_code: '9876543210',
        company: null,
        city: 'Mumbai',
        state: null,
        country: null,
        lead_owner: null,
        crm_status: 'GOOD_LEAD_FOLLOW_UP',
        crm_note: 'Status: Good',
        data_source: 'meridian_tower',
        possession_time: null,
        description: null,
      },
      {
        created_at: null,
        name: 'Jane Smith',
        email: null,
        country_code: '+1',
        mobile_without_country_code: '5551234567',
        company: null,
        city: 'Delhi',
        state: null,
        country: null,
        lead_owner: null,
        crm_status: 'DID_NOT_CONNECT',
        crm_note: 'Status: No Response',
        data_source: 'eden_park',
        possession_time: null,
        description: null,
      },
      {
        created_at: null,
        name: 'No Contact Info',
        email: 'test@test.com',
        country_code: null,
        mobile_without_country_code: null,
        company: null,
        city: 'Bangalore',
        state: null,
        country: null,
        lead_owner: null,
        crm_status: null,
        crm_note: null,
        data_source: 'leads_on_demand',
        possession_time: null,
        description: null,
      },
      {
        created_at: null,
        name: 'Invalid Row',
        email: null,
        country_code: null,
        mobile_without_country_code: null,
        company: null,
        city: null,
        state: null,
        country: null,
        lead_owner: null,
        crm_status: null,
        crm_note: null,
        data_source: null,
        possession_time: null,
        description: null,
      },
    ]);

    mockProvider.extractBatch.mockResolvedValueOnce(mockAIResponse);

    // 3. Execute service
    const results = await ExtractionService.run(csvBuffer);

    // 4. Verification
    expect(results.totalRecords).toBe(4);
    expect(results.importedCount).toBe(3);
    expect(results.skippedCount).toBe(1);

    // Check mapped record details
    const [john, jane] = results.records;
    expect(john.name).toBe('John Doe');
    expect(john.email).toBe('john@example.com');
    expect(john.crm_status).toBe('GOOD_LEAD_FOLLOW_UP');
    expect(john.data_source).toBe('meridian_tower');

    expect(jane.name).toBe('Jane Smith');
    expect(jane.country_code).toBe('+1');
    expect(jane.mobile_without_country_code).toBe('5551234567');
    expect(jane.crm_status).toBe('DID_NOT_CONNECT');

    // Check skipped record
    const skipped = results.skippedRecords[0];
    expect(skipped.originalRow).toBe(4);
    expect(skipped.reason).toContain('neither a valid email nor a mobile phone number');
  });

  it('should detect and filter out hallucinated emails/phones not present in source rows', async () => {
    const csvBuffer = Buffer.from(
      `Full Name,Email\n` +
      `John Doe,john@example.com\n`
    );

    // Mock AI return containing hallucinated mobile number that wasn't in CSV
    const mockAIResponse = JSON.stringify([
      {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_without_country_code: '9999999999', // Hallucinated phone
      },
    ]);

    mockProvider.extractBatch.mockResolvedValueOnce(mockAIResponse);

    const results = await ExtractionService.run(csvBuffer);
    expect(results.records[0].mobile_without_country_code).toBeNull(); // Should be filtered out
  });
});

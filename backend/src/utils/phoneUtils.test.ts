import { describe, it, expect } from 'vitest';
import { normalizePhone } from './phoneUtils';

describe('normalizePhone', () => {
  it('should return nulls if phone is not provided', () => {
    const result = normalizePhone(null);
    expect(result).toEqual({ countryCode: null, mobileNumber: null });
  });

  it('should clean spaces, dashes and parentheses', () => {
    const result = normalizePhone('(987) 654-3210');
    expect(result).toEqual({ countryCode: null, mobileNumber: '9876543210' });
  });

  it('should parse country code and mobile number when country code is separate', () => {
    const result = normalizePhone('9876543210', '+91');
    expect(result.countryCode).toBe('+91');
    expect(result.mobileNumber).toBe('9876543210');
  });

  it('should extract country code prefix from long number starting with plus', () => {
    const result = normalizePhone('+919876543210');
    expect(result.countryCode).toBe('+91');
    expect(result.mobileNumber).toBe('9876543210');
  });

  it('should extract country code starting with 00', () => {
    const result = normalizePhone('0019876543210');
    expect(result.countryCode).toBe('+1');
    expect(result.mobileNumber).toBe('9876543210');
  });

  it('should default country code for 12 digit numbers starting with 91', () => {
    const result = normalizePhone('919876543210');
    expect(result.countryCode).toBe('+91');
    expect(result.mobileNumber).toBe('9876543210');
  });
});

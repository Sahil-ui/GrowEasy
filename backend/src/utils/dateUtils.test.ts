import { describe, it, expect } from 'vitest';
import { normalizeDate } from './dateUtils';

describe('normalizeDate', () => {
  it('should return null if no date is provided', () => {
    expect(normalizeDate(null)).toBeNull();
    expect(normalizeDate('')).toBeNull();
  });

  it('should parse valid ISO dates', () => {
    const isoString = '2026-05-13T14:20:48.000Z';
    expect(normalizeDate(isoString)).toBe(isoString);
  });

  it('should parse YYYY-MM-DD formats', () => {
    const raw = '2026-05-13';
    const parsed = normalizeDate(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.startsWith('2026-05-13')).toBe(true);
  });

  it('should parse DD/MM/YYYY formats', () => {
    const raw = '13/05/2026';
    const parsed = normalizeDate(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.startsWith('2026-05-13')).toBe(true);
  });

  it('should parse DD-MM-YYYY with timestamps', () => {
    const raw = '13-05-2026 14:25:30';
    const parsed = normalizeDate(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.startsWith('2026-05-13T14:25:30')).toBe(true);
  });

  it('should return null for invalid date values', () => {
    expect(normalizeDate('not-a-date')).toBeNull();
    expect(normalizeDate('32/13/2026')).toBeNull();
  });
});

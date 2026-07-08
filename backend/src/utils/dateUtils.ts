/**
 * Normalizes an arbitrary date string into a parseable ISO format.
 * Uses Date.UTC to ensure deterministic, timezone-independent output.
 * If formatting fails, returns null.
 */
export const normalizeDate = (rawDate: string | null): string | null => {
  if (!rawDate) {
    return null;
  }

  const cleanDate = rawDate.trim();

  // Try parsing DD/MM/YYYY or DD-MM-YYYY format first (common custom exports)
  const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const dmyMatch = cleanDate.match(dmyRegex);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const second = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;

    // Validate ranges
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const utcTime = Date.UTC(year, month - 1, day, hour, minute, second);
      return new Date(utcTime).toISOString();
    }
  }

  // Handle standard ISO-8601 or YYYY-MM-DD formats
  const ymdRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const ymdMatch = cleanDate.match(ymdRegex);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
    const minute = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    const second = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const utcTime = Date.UTC(year, month - 1, day, hour, minute, second);
      return new Date(utcTime).toISOString();
    }
  }

  // Fallback: try standard JavaScript Date parsing
  const dateObj = new Date(cleanDate);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString();
  }

  return null;
};

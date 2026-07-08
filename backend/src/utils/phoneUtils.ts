/**
 * Normalizes a phone number and country code.
 * Strips parentheses, spaces, dashes, and extra formatting.
 * Splits country code and mobile number if they are combined.
 */
export interface NormalizedPhone {
  countryCode: string | null;
  mobileNumber: string | null;
}

export const normalizePhone = (
  rawPhone: string | null,
  rawCountryCode: string | null = null
): NormalizedPhone => {
  if (!rawPhone) {
    return { countryCode: null, mobileNumber: null };
  }

  // Strip all non-digit characters except +
  let cleanPhone = rawPhone.replace(/[^\d+]/g, '');

  let finalCountryCode = rawCountryCode ? rawCountryCode.trim().replace(/[^\d+]/g, '') : null;
  let finalMobileNumber = cleanPhone;

  // Handle embedded country codes (e.g. +919876543210 or 00919876543210 or 919876543210)
  if (cleanPhone.startsWith('+')) {
    // E.g. +919876543210 -> country code is +91, mobile is 9876543210
    // Standard length of mobile numbers without country code is usually 10 digits
    // We can extract everything except the last 10 digits as the country code
    if (cleanPhone.length > 10) {
      finalCountryCode = cleanPhone.slice(0, cleanPhone.length - 10);
      finalMobileNumber = cleanPhone.slice(cleanPhone.length - 10);
    } else {
      finalCountryCode = null;
      finalMobileNumber = cleanPhone;
    }
  } else if (cleanPhone.startsWith('00')) {
    // E.g. 00919876543210 -> normalize to +91
    const parts = cleanPhone.slice(2);
    if (parts.length > 10) {
      finalCountryCode = `+${parts.slice(0, parts.length - 10)}`;
      finalMobileNumber = parts.slice(parts.length - 10);
    } else {
      finalMobileNumber = parts;
    }
  } else if (!finalCountryCode && cleanPhone.length > 10) {
    // If no country code was explicitly provided and number starts with e.g. 91
    // and total length is 12 (typical for Indian numbers: 91 + 10 digits)
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      finalCountryCode = '+91';
      finalMobileNumber = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      // US numbers: 1 + 10 digits
      finalCountryCode = '+1';
      finalMobileNumber = cleanPhone.slice(1);
    } else {
      // Fallback
      finalCountryCode = `+${cleanPhone.slice(0, cleanPhone.length - 10)}`;
      finalMobileNumber = cleanPhone.slice(cleanPhone.length - 10);
    }
  }

  // Format country code to have a leading +
  if (finalCountryCode && !finalCountryCode.startsWith('+')) {
    finalCountryCode = `+${finalCountryCode}`;
  }

  // Clean double plus symbols
  if (finalCountryCode) {
    finalCountryCode = finalCountryCode.replace(/\++/g, '+');
  }

  return {
    countryCode: finalCountryCode || null,
    mobileNumber: finalMobileNumber || null,
  };
};

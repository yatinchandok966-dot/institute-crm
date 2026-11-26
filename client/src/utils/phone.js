export const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91', name: 'India' },
  { code: '+1', label: 'US +1', name: 'USA / Canada' },
  { code: '+44', label: 'UK +44', name: 'United Kingdom' },
  { code: '+971', label: 'AE +971', name: 'UAE' },
  { code: '+61', label: 'AU +61', name: 'Australia' },
  { code: '+65', label: 'SG +65', name: 'Singapore' },
  { code: '+966', label: 'SA +966', name: 'Saudi Arabia' },
  { code: '+49', label: 'DE +49', name: 'Germany' },
  { code: '+33', label: 'FR +33', name: 'France' },
  { code: '+81', label: 'JP +81', name: 'Japan' }
];

/**
 * Splits a stored phone string into { countryCode, localNumber }.
 * Defaults to '+91' if no explicit country code is present.
 */
export function splitPhoneAndCountryCode(rawPhone) {
  const str = String(rawPhone || '').trim();
  if (!str) return { countryCode: '+91', localNumber: '' };

  if (str.startsWith('+')) {
    const digitsOnly = str.replace(/\D/g, '');
    // Match longest known country code first
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const item of sorted) {
      const codeDigits = item.code.slice(1);
      if (digitsOnly.startsWith(codeDigits) && digitsOnly.length > codeDigits.length) {
        return {
          countryCode: item.code,
          localNumber: digitsOnly.slice(codeDigits.length).slice(0, 10)
        };
      }
    }
  }

  const digits = str.replace(/\D/g, '').replace(/^0+/, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return { countryCode: '+91', localNumber: digits.slice(2) };
  }
  return {
    countryCode: '+91',
    localNumber: digits.slice(-10)
  };
}

/**
 * Combines a country code and 10-digit local number for storage.
 */
export function formatPhoneWithCountryCode(countryCode, localNumber) {
  const cleanLocal = String(localNumber || '').replace(/\D/g, '');
  if (!cleanLocal) return '';
  const code = countryCode || '+91';
  return `${code} ${cleanLocal}`;
}

/**
 * Formats a phone number for https://wa.me/<digits>
 * Prepends defaultCountryCode ('91') when given a 10-digit local number
 * so WhatsApp never treats the first 2 digits of a local number as a country code.
 */
export function formatWhatsAppPhone(rawPhone, defaultCountryCode = '91') {
  let digits = String(rawPhone || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  if (digits.length === 10) {
    digits = `${defaultCountryCode}${digits}`;
  }
  return digits;
}

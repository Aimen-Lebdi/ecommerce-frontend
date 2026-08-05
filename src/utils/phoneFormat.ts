// Phone number formatting utilities for Algerian mobile numbers.
//
// The backend stores digits-only local numbers such as "0500000000"
// (validator: /^(\+?213|0)(5|6|7)\d{8}$/ with ar-DZ locale; spaces are
// rejected). The UI displays them masked as "05 00 00 00 00".

const LOCAL_PHONE_RE = /^0[567]\d{8}$/;

/**
 * Normalize any phone input to the 10 local digits form ("0" + 9 digits).
 * - Strips all non-digit characters (spaces, "+", dashes).
 * - Converts a leading "213" country code into the local leading "0".
 * - Caps the result at 10 digits (the local length).
 *
 * Returns "" when the input has no digits.
 */
export const phoneToLocalDigits = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("213")) {
    // "+213555123456" / "213555123456" -> "0555123456"
    const local = digits.slice(3, 12);
    return local ? `0${local}` : "";
  }

  return digits.slice(0, 10);
};

/**
 * Format local digits into the display mask "05 55 12 34 56" (pairs of digits
 * separated by single spaces). Non-digit characters are ignored, so it is safe
 * to call on raw stored values.
 */
export const formatPhoneMask = (digits: string): string => {
  const cleaned = digits.replace(/\D/g, "");
  return cleaned.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
};

/**
 * True when the value represents a complete, valid Algerian mobile number:
 * "0" followed by 5/6/7 and eight more digits. Both raw and masked forms are
 * accepted (non-digits are stripped before testing).
 */
export const isCompleteLocalPhone = (value: string): boolean =>
  LOCAL_PHONE_RE.test(value.replace(/\D/g, ""));

/**
 * Render a stored phone value for display: convert to local digits and apply
 * the mask. Falls back to the raw value when it cannot be converted to a
 * complete local number (so legacy/odd data is still shown as-is).
 */
export const formatPhoneForDisplay = (value: string): string => {
  const local = phoneToLocalDigits(value);
  return isCompleteLocalPhone(local) ? formatPhoneMask(local) : value;
};

/**
 * Strict live-mask transform for a phone input change.
 *
 * - Only digits are kept; any other character is dropped.
 * - The first digit must be "0", or a 5/6/7 is auto-prefixed with "0".
 * - The second digit must be 5, 6 or 7 (Algerian mobile prefixes) — otherwise
 *   that invalid digit is dropped.
 * - The result is capped at 10 digits and returned in masked form
 *   ("05 55 12 34 56").
 */
export const maskPhoneChange = (rawValue: string): string => {
  let digits = rawValue.replace(/\D/g, "");

  if (digits.length === 0) return "";

  // Position 0 must be "0"; auto-prefix when the user typed a prefix digit.
  if (digits[0] === "5" || digits[0] === "6" || digits[0] === "7") {
    digits = `0${digits}`;
  } else if (digits[0] !== "0") {
    return "";
  }

  // Position 1 must be 5, 6 or 7.
  if (digits.length > 1 && !"567".includes(digits[1])) {
    digits = digits[0] + digits.slice(2);
  }

  return formatPhoneMask(digits.slice(0, 10));
};

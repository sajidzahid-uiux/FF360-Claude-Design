/**
 * Centralized validation utilities for security and data integrity
 */

/**
 * Validates numeric ID format (numeric only)
 * Used for organization IDs, job IDs, lead IDs, invoice IDs, etc.
 * Examples: "127", "42", "1001", 250
 */
export const isValidNumericId = (id: string | number): boolean => {
  const strId = String(id);
  return /^\d{1,10}$/.test(strId);
};

/**
 * Validates storage key format (alphanumeric, underscores, hyphens only)
 * Must start with a letter, 1-100 characters
 */
export const isValidStorageKey = (key: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/.test(key);
};

/**
 * Validates permission code format (resource_action pattern)
 */
export const isValidPermissionCode = (code: string): boolean => {
  return /^[a-z_]+_(read|write|delete)$/.test(code);
};

/**
 * Checks for suspicious/malicious patterns (XSS, code injection attempts)
 * Detects: script tags, javascript: protocol, event handlers, data URIs, etc.
 */
export const isSuspiciousValue = (value: string): boolean => {
  return /<script|javascript:|data:text\/html|vbscript:|on\w+\s*=|<iframe|<object|<embed/i.test(
    value
  );
};

/**
 * Sanitizes string by removing control characters and null bytes
 */
export const sanitizeValue = (value: string): string => {
  if (typeof value !== "string") {
    return String(value);
  }

  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, "");
};

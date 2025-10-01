/**
 * Utility functions for input sanitization
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} options.trim - Whether to trim whitespace (default: true)
 * @param {boolean} options.lowercase - Whether to convert to lowercase (default: false)
 * @param {number} options.maxLength - Maximum allowed length (default: 255)
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, { trim = true, lowercase = false, maxLength = 255 } = {}) => {
  if (input === null || input === undefined) return '';
  
  let sanitized = String(input);
  
  // Remove any null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove any HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');
  
  // Remove control characters (except newlines)
  sanitized = sanitized.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // Apply options
  if (trim) sanitized = sanitized.trim();
  if (lowercase) sanitized = sanitized.toLowerCase();
  if (maxLength) sanitized = sanitized.substring(0, maxLength);
  
  return sanitized;
};

/**
 * Sanitize email input
 * @param {string} email - The email to sanitize
 * @returns {string} Sanitized email or empty string if invalid
 */
const sanitizeEmail = (email) => {
  if (!email) return '';
  
  const sanitized = sanitizeString(email, { lowercase: true, trim: true });
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) return '';
  
  return sanitized;
};

/**
 * Sanitize password input
 * @param {string} password - The password to sanitize
 * @returns {string} Sanitized password or empty string if invalid
 */
const sanitizePassword = (password) => {
  if (!password) return '';
  
  // Remove any whitespace
  const sanitized = password.replace(/\s+/g, '');
  
  // Enforce minimum password requirements
  if (sanitized.length < 8) return '';
  
  return sanitized;
};

/**
 * Sanitize name input
 * @param {string} name - The name to sanitize
 * @returns {string} Sanitized name
 */
const sanitizeName = (name) => {
  if (!name) return '';
  
  // Allow letters, spaces, hyphens, and apostrophes
  return sanitizeString(name, { trim: true })
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s+/g, ' ');
};

export {
  sanitizeString,
  sanitizeEmail,
  sanitizePassword,
  sanitizeName
};

/**
 * PII Redaction Utility
 * Redacts personally identifiable information before logging or sending to LLM
 * NOTE: Regex-based redaction is not perfect. For production, consider ML-based PII detection.
 */

// Regex patterns for common PII
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  indianPhone: /(\+91|0)?[6-9]\d{9}\b/g,
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  pan: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  url: /https?:\/\/[^\s]+/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
};

/**
 * Redact PII from text
 * @param {string} text - Text to redact
 * @param {object} options - Redaction options
 * @returns {string} - Redacted text
 */
export function redactPII(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const {
    redactEmails = true,
    redactPhones = true,
    redactIds = true,
    redactUrls = false,
    placeholder = '[REDACTED]'
  } = options;

  let redacted = text;

  // Redact emails
  if (redactEmails) {
    redacted = redacted.replace(PII_PATTERNS.email, placeholder);
  }

  // Redact phone numbers
  if (redactPhones) {
    redacted = redacted.replace(PII_PATTERNS.phone, placeholder);
    redacted = redacted.replace(PII_PATTERNS.indianPhone, placeholder);
  }

  // Redact ID numbers
  if (redactIds) {
    redacted = redacted.replace(PII_PATTERNS.aadhaar, placeholder);
    redacted = redacted.replace(PII_PATTERNS.pan, placeholder);
    redacted = redacted.replace(PII_PATTERNS.creditCard, placeholder);
    redacted = redacted.replace(PII_PATTERNS.ssn, placeholder);
  }

  // Redact URLs (optional)
  if (redactUrls) {
    redacted = redacted.replace(PII_PATTERNS.url, placeholder);
  }

  return redacted;
}

/**
 * Check if text contains PII
 * @param {string} text - Text to check
 * @returns {boolean} - True if PII detected
 */
export function containsPII(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return Object.values(PII_PATTERNS).some(pattern => pattern.test(text));
}

/**
 * Get PII matches from text
 * @param {string} text - Text to analyze
 * @returns {object} - Object with PII types and matches
 */
export function detectPII(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }

  const detected = {};

  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detected[type] = matches;
    }
  });

  return detected;
}

/**
 * Sanitize user input for safe storage
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }

  return sanitized;
}

export default {
  redactPII,
  containsPII,
  detectPII,
  sanitizeInput
};

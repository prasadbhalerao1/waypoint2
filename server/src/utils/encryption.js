/**
 * Encryption Utility
 * AES-256-GCM encryption for sensitive data storage
 * Uses Node.js built-in crypto module
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derive encryption key from password/secret
 * @param {string} password - Password or secret key
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} - Derived key
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param {string} plaintext - Text to encrypt
 * @param {string} secretKey - Encryption key (from env)
 * @returns {string} - Encrypted data (base64 encoded)
 */
export function encryptWithKey(plaintext, secretKey = null) {
  try {
    if (!plaintext) {
      throw new Error('Plaintext is required');
    }

    // Use provided key or fall back to env var
    const key = secretKey || process.env.ENCRYPTION_KEY;
    
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from secret
    const derivedKey = deriveKey(key, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    // Return base64 encoded
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} ciphertext - Encrypted data (base64 encoded)
 * @param {string} secretKey - Encryption key (from env)
 * @returns {string} - Decrypted plaintext
 */
export function decryptWithKey(ciphertext, secretKey = null) {
  try {
    if (!ciphertext) {
      throw new Error('Ciphertext is required');
    }

    // Use provided key or fall back to env var
    const key = secretKey || process.env.ENCRYPTION_KEY;
    
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    // Decode base64
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from secret
    const derivedKey = deriveKey(key, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Hash data using SHA-256 (one-way)
 * @param {string} data - Data to hash
 * @returns {string} - Hex hash
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Hex token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt object (converts to JSON first)
 * @param {object} obj - Object to encrypt
 * @param {string} secretKey - Encryption key
 * @returns {string} - Encrypted data
 */
export function encryptObject(obj, secretKey = null) {
  const json = JSON.stringify(obj);
  return encryptWithKey(json, secretKey);
}

/**
 * Decrypt to object (parses JSON after decryption)
 * @param {string} ciphertext - Encrypted data
 * @param {string} secretKey - Encryption key
 * @returns {object} - Decrypted object
 */
export function decryptObject(ciphertext, secretKey = null) {
  const json = decryptWithKey(ciphertext, secretKey);
  return JSON.parse(json);
}

export default {
  encryptWithKey,
  decryptWithKey,
  hashData,
  generateToken,
  encryptObject,
  decryptObject
};

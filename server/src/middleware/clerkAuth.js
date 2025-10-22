/**
 * Clerk Authentication Middleware
 * Note: Clerk middleware is now configured in src/index.js
 * This file is kept for reference and custom auth utilities
 */

import { getAuth } from '@clerk/express';

/**
 * Get user ID from Clerk auth
 * @param {Request} req - Express request object
 * @returns {string|null} - Clerk user ID or null
 */
export function getUserId(req) {
  const { userId } = getAuth(req);
  return userId;
}

/**
 * Check if user is authenticated
 * @param {Request} req - Express request object
 * @returns {boolean} - True if authenticated
 */
export function isAuthenticated(req) {
  const { userId } = getAuth(req);
  return !!userId;
}

export default {
  getUserId,
  isAuthenticated
};

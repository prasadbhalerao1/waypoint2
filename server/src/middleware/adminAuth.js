/**
 * Admin Authorization Middleware
 * Restricts access to admin-only routes
 */

import { getAuth, clerkClient } from '@clerk/express';

// Allowed admin emails
const ADMIN_EMAILS = [
  'prasad9a38@gmail.com',
  'waypointplatform@gmail.com'
];

/**
 * Middleware to check if user is an admin
 * Verifies user email against whitelist
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get primary email address
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'No email address found' 
      });
    }

    // Check if email is in admin list
    const isAdmin = ADMIN_EMAILS.includes(primaryEmail.emailAddress.toLowerCase());

    if (!isAdmin) {
      console.warn(`⚠️ Unauthorized admin access attempt by: ${primaryEmail.emailAddress}`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this resource' 
      });
    }

    // User is admin, continue
    console.log(`✅ Admin access granted to: ${primaryEmail.emailAddress}`);
    next();

  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to verify admin status' 
    });
  }
};

/**
 * Check if a user ID is an admin (utility function)
 */
export const isUserAdmin = async (userId) => {
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return false;
    }

    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
      return false;
    }

    return ADMIN_EMAILS.includes(primaryEmail.emailAddress.toLowerCase());
  } catch (error) {
    console.error('❌ Error checking admin status:', error.message);
    return false;
  }
};

export default {
  requireAdmin,
  isUserAdmin,
  ADMIN_EMAILS
};

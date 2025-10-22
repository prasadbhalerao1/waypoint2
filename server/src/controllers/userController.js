/**
 * User Controller
 * Manages user profiles, preferences, and gamification
 */

import User from '../models/User.js';
import { getAuth, clerkClient } from '@clerk/express';
import { generateUsername, generateSuggestions, isValidUsername } from '../utils/usernameGenerator.js';

/**
 * GET /api/v1/user/me
 * Get current user profile
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ clerkId: userId });

    // Create user if doesn't exist (first login)
    if (!user) {
      // Auto-generate username and store in Clerk
      const username = generateUsername();
      
      // Update Clerk user with username in publicMetadata
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { username }
      });
      
      user = new User({
        clerkId: userId,
        email: req.auth.sessionClaims?.email || '',
        role: 'student'
      });
      await user.save();
    }

    res.json({ user });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/user/me
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = req.body;
    
    // Prevent updating sensitive fields
    delete updates.clerkId;
    delete updates.role;
    delete updates.xp;
    delete updates.level;
    
    // Handle username update separately via Clerk
    if (updates.username) {
      if (!isValidUsername(updates.username)) {
        return res.status(400).json({ error: 'Invalid username format. Must be camelCase (e.g., happyPixel).' });
      }
      
      // Update username in Clerk publicMetadata
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { username: updates.username }
      });
      
      // Remove from updates as it's not in our DB
      delete updates.username;
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/user/me/theme
 * Update user theme
 */
export const updateTheme = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { theme } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ theme: user.theme });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/user/me/mood
 * Update user mood
 */
export const updateMood = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { mood } = req.body;

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: 'Mood must be between 1 and 5' });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: { 
          currentMood: mood,
          lastMoodUpdate: new Date()
        } 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ mood: user.currentMood });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/user/me/consent
 * Update user consents
 */
export const updateConsent = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { screenings, analytics, counsellorSharing } = req.body;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (screenings !== undefined) {
      user.consents.screenings = screenings;
    }
    if (analytics !== undefined) {
      user.consents.analytics = analytics;
    }
    if (counsellorSharing !== undefined) {
      user.consents.counsellorSharing = counsellorSharing;
    }

    user.consents.timestamp = new Date();
    await user.save();

    res.json({ consents: user.consents });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/user/me/complete-onboarding
 * Mark onboarding as complete
 */
export const completeOnboarding = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { onboardingComplete: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ onboardingComplete: true });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/user/me/stats
 * Get user gamification stats
 */
export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      progressPercentage: user.progressPercentage
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/user/me
 * Delete user account and all data
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete user and all associated data
    await User.deleteOne({ clerkId: userId });
    
    // TODO: Also delete ChatLogs, Bookings, ForumPosts, etc.
    // This should be done in a transaction or background job

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/user/username/check/:username
 * Check if username is available
 */
export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    if (!isValidUsername(username)) {
      return res.json({ 
        available: false, 
        error: 'Invalid username format. Must be camelCase (e.g., happyPixel).' 
      });
    }
    
    // Check if username exists in any Clerk user's publicMetadata
    const users = await clerkClient.users.getUserList();
    const taken = users.data.some(u => u.publicMetadata?.username === username);
    
    res.json({ 
      available: !taken,
      username 
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/user/username/suggestions
 * Generate username suggestions
 */
export const getUsernameSuggestions = async (req, res, next) => {
  try {
    // Generate 5 random suggestions
    const suggestions = generateSuggestions(5);
    
    res.json({ suggestions });
    
  } catch (error) {
    next(error);
  }
};

export default {
  getCurrentUser,
  updateProfile,
  updateTheme,
  updateMood,
  updateConsent,
  completeOnboarding,
  getUserStats,
  deleteAccount,
  checkUsername,
  getUsernameSuggestions
};

/**
 * Admin Controller
 * Analytics, counsellor management, and admin tools
 */

import User from '../models/User.js';
import ChatLog from '../models/ChatLog.js';
import Booking from '../models/Booking.js';
import ForumPost from '../models/ForumPost.js';
import Resource from '../models/Resource.js';
import { getAuth, clerkClient } from '@clerk/express';

/**
 * Check if user is admin
 * Specifically allows prasad9a38@gmail.com and waypointplatform@gmail.com as admins
 */
const isAdmin = async (userId) => {
  try {
    // Get user email from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    
    // List of admin emails
    const adminEmails = [
      'prasad9a38@gmail.com',
      'waypointplatform@gmail.com',
      process.env.ADMIN_EMAIL
    ];
    
    // Check if email is in admin list
    if (adminEmails.includes(userEmail)) {
      return true;
    }
    
    // Also check database role
    const user = await User.findOne({ clerkId: userId });
    return user && (user.role === 'admin' || user.role === 'super_admin');
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

/**
 * GET /api/v1/admin/analytics
 * Get anonymized analytics dashboard data
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { from, to, days = 7 } = req.query;

    // Calculate date range
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));

    // Total users
    const totalUsers = await User.countDocuments({ role: 'student', isActive: true });

    // Daily Active Users (DAU) - users who chatted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dau = await ChatLog.distinct('userId', {
      createdAt: { $gte: today }
    }).then(users => users.length);

    // Total bookings
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Bookings per day (last 14 days)
    const bookingsPerDay = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average chat sentiment (last 7 days)
    const sentimentData = await ChatLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          sentiment: { $ne: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgSentiment: { $avg: '$sentiment' },
          count: { $sum: 1 }
        }
      }
    ]);

    const avgChatSentiment = sentimentData.length > 0 ? sentimentData[0].avgSentiment : 0;

    // Chat volume per day (for trend detection)
    const chatVolume = await ChatLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate moving average and Z-score for chat volume
    const chatCounts = chatVolume.map(v => v.count);
    const mean = chatCounts.reduce((a, b) => a + b, 0) / chatCounts.length || 0;
    const variance = chatCounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / chatCounts.length || 0;
    const stdDev = Math.sqrt(variance);

    const chatTrend = chatVolume.map(v => ({
      date: v._id,
      count: v.count,
      zScore: stdDev > 0 ? (v.count - mean) / stdDev : 0
    }));

    // Escalation counts
    const escalationCount = await ChatLog.countDocuments({
      escalate: true,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Weekly screenings (if stored)
    const weeklyScreenings = await ChatLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Flagged posts
    const flaggedPosts = await ForumPost.countDocuments({
      reviewRequired: true,
      isActive: true
    });

    // Resource engagement
    const topResources = await Resource.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views completions type');

    // Mood distribution
    const moodDistribution = await User.aggregate([
      {
        $match: { role: 'student', isActive: true, currentMood: { $exists: true } }
      },
      {
        $group: {
          _id: '$currentMood',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average streak
    const avgStreak = await User.aggregate([
      {
        $match: { role: 'student', isActive: true }
      },
      {
        $group: {
          _id: null,
          avgCurrent: { $avg: '$streak.current' },
          avgLongest: { $avg: '$streak.longest' }
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        dau,
        totalBookings,
        weeklyScreenings,
        escalationCount,
        flaggedPosts
      },
      bookingsPerDay,
      avgChatSentiment,
      chatTrend: {
        data: chatTrend,
        mean,
        stdDev
      },
      moodDistribution,
      streaks: avgStreak.length > 0 ? avgStreak[0] : { avgCurrent: 0, avgLongest: 0 },
      topResources,
      dateRange: {
        from: startDate,
        to: endDate
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/counsellors
 * Get all counsellors (for management)
 */
export const getCounsellors = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verified, active } = req.query;

    const query = { role: 'counsellor' };

    if (verified !== undefined) {
      query['counsellorProfile.verified'] = verified === 'true';
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const counsellors = await User.find(query)
      .select('clerkId name email counsellorProfile createdAt')
      .sort({ createdAt: -1 });

    res.json({ counsellors });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/counsellors/:id/verify
 * Verify a counsellor
 */
export const verifyCounsellor = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { verified, notes } = req.body;

    const counsellor = await User.findOne({ clerkId: id, role: 'counsellor' });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    counsellor.counsellorProfile.verified = verified;
    counsellor.counsellorProfile.verifiedBy = userId;
    counsellor.counsellorProfile.verifiedAt = new Date();

    await counsellor.save();

    res.json({
      message: `Counsellor ${verified ? 'verified' : 'unverified'} successfully`,
      counsellor
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/flagged-posts
 * Get flagged forum posts for moderation
 */
export const getFlaggedPosts = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const posts = await ForumPost.find({
      reviewRequired: true,
      isActive: true
    })
      .sort({ flags: -1, createdAt: -1 })
      .select('+flaggedBy');

    res.json({ posts });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/posts/:id/moderate
 * Moderate a flagged post
 */
export const moderatePost = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve', 'remove', 'lock'

    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.reviewRequired = false;
    post.moderatedBy = userId;
    post.moderatedAt = new Date();
    post.moderationNotes = notes;

    if (action === 'approve') {
      post.isApproved = true;
      post.flags = 0;
      post.flaggedBy = [];
    } else if (action === 'remove') {
      post.isActive = false;
      post.isApproved = false;
    } else if (action === 'lock') {
      post.isLocked = true;
    }

    await post.save();

    res.json({
      message: `Post ${action}d successfully`,
      post
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/alerts
 * Get system alerts based on trend detection
 */
export const getAlerts = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!await isAdmin(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const alerts = [];

    // Check for spike in escalations
    const recentEscalations = await ChatLog.countDocuments({
      escalate: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentEscalations > 5) {
      alerts.push({
        type: 'crisis',
        severity: 'high',
        message: `${recentEscalations} crisis escalations in the last 24 hours`,
        timestamp: new Date()
      });
    }

    // Check for low mood trend
    const lowMoodCount = await User.countDocuments({
      role: 'student',
      currentMood: { $lte: 2 },
      lastMoodUpdate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalActiveUsers = await User.countDocuments({ role: 'student', isActive: true });
    const lowMoodPercentage = (lowMoodCount / totalActiveUsers) * 100;

    if (lowMoodPercentage > 20) {
      alerts.push({
        type: 'mood_trend',
        severity: 'medium',
        message: `${lowMoodPercentage.toFixed(1)}% of students reporting low mood`,
        timestamp: new Date()
      });
    }

    // Check for flagged content
    const flaggedCount = await ForumPost.countDocuments({ reviewRequired: true });

    if (flaggedCount > 10) {
      alerts.push({
        type: 'moderation',
        severity: 'low',
        message: `${flaggedCount} posts flagged for review`,
        timestamp: new Date()
      });
    }

    res.json({ alerts });

  } catch (error) {
    next(error);
  }
};

export default {
  getAnalytics,
  getCounsellors,
  verifyCounsellor,
  getFlaggedPosts,
  moderatePost,
  getAlerts
};

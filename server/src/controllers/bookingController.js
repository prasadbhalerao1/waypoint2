/**
 * Booking Controller
 * Manages counsellor appointment bookings
 */

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { encryptObject } from '../utils/encryption.js';
import { getAuth, clerkClient } from '@clerk/express';
import { sendBookingConfirmation } from '../utils/email.js';

/**
 * POST /api/v1/bookings
 * Create a new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let { counsellorId, start, end, consentGiven, reason, screeningData, studentEmail, studentName } = req.body;

    // Validate required fields
    if (!start || !end || consentGiven === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: start, end, consentGiven' 
      });
    }

    // Auto-resolve counsellorId if missing or set to default placeholder
    if (!counsellorId || counsellorId === 'default_counselor') {
      const verifiedCounsellor = await User.findOne({
        role: 'counsellor',
        'counsellorProfile.verified': true,
        isActive: true
      });

      if (verifiedCounsellor) {
        counsellorId = verifiedCounsellor.clerkId;
      } else {
        const anyCounsellor = await User.findOne({ role: 'counsellor' });
        if (anyCounsellor) {
          counsellorId = anyCounsellor.clerkId;
        } else {
          counsellorId = 'system_counsellor_fallback';
        }
      }
    }

    // Validate dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check if counsellor exists if it's a real user ID
    let counsellorName = 'Professional Counselor';
    if (counsellorId !== 'system_counsellor_fallback') {
      const counsellor = await User.findOne({ clerkId: counsellorId });
      if (counsellor) {
        counsellorName = counsellor.name || counsellor.counsellorProfile?.name || counsellorName;
        // Update total sessions
        if (counsellor.counsellorProfile) {
          counsellor.counsellorProfile.totalSessions = (counsellor.counsellorProfile.totalSessions || 0) + 1;
          await counsellor.save();
        }
      }
    }

    // Check for booking conflicts
    const hasConflict = await Booking.hasConflict(counsellorId, startDate, endDate);

    if (hasConflict) {
      return res.status(409).json({ 
        error: 'Time slot not available',
        message: 'This counsellor is already booked for the selected time'
      });
    }

    // Encrypt sensitive data if consent given
    let encryptedPayload = null;
    if (consentGiven && screeningData) {
      encryptedPayload = encryptObject(screeningData);
    }

    // Create booking
    const booking = new Booking({
      studentId: userId,
      counsellorId,
      start: startDate,
      end: endDate,
      consentGiven,
      encryptedPayload,
      reason,
      status: 'confirmed'
    });

    await booking.save();

    // Send email confirmation
    try {
      const emailToUse = studentEmail || (await clerkClient.users.getUser(userId))?.emailAddresses?.[0]?.emailAddress;
      
      if (emailToUse) {
        await sendBookingConfirmation({
          studentEmail: emailToUse,
          counsellorName,
          start: booking.start,
          end: booking.end,
          bookingId: booking._id.toString()
        });
        console.log(`✅ Booking confirmation email sent to ${emailToUse}`);
      }
    } catch (emailError) {
      console.warn('⚠️ Booking confirmation email skipped/failed:', emailError?.message);
    }

    res.status(201).json({
      booking_id: booking._id,
      status: booking.status,
      start: booking.start,
      end: booking.end,
      counsellorId: booking.counsellorId,
      message: 'Booking confirmed successfully. Check your email for details.'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings/match
 * Request instant counsellor match
 */
export const requestMatch = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { locale, summary } = req.body;

    const counsellor = await User.findOne({
      role: 'counsellor',
      'counsellorProfile.verified': true,
      isActive: true
    });

    res.json({
      match_request_id: `match_${Date.now()}`,
      status: 'matched',
      counsellor: counsellor ? {
        id: counsellor.clerkId,
        name: counsellor.name || 'Dr. Sarah Sharma',
        specialty: counsellor.counsellorProfile?.specializations?.[0] || 'Student Wellbeing & Anxiety Support',
        rating: counsellor.counsellorProfile?.averageRating || 4.9,
        eta: '5 minutes'
      } : {
        id: 'counselor_123',
        name: 'Dr. Sarah Sharma',
        specialty: 'Student Wellbeing & Anxiety Support',
        rating: 4.9,
        eta: '5 minutes'
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings
 * Get user's bookings
 */
export const getBookings = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: userId });
    let query = {};

    if (!user || user.role === 'student') {
      query.studentId = userId;
    } else if (user.role === 'counsellor') {
      query.counsellorId = userId;
    }

    const { status, upcoming } = req.query;

    if (status) query.status = status;
    if (upcoming === 'true') query.start = { $gte: new Date() };

    const bookings = await Booking.find(query)
      .sort({ start: 1 })
      .select('-encryptedPayload -sessionNotes');

    res.json({ bookings });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:id
 * Get booking details
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (booking.studentId !== userId && 
        booking.counsellorId !== userId && 
        user?.role !== 'admin' && 
        user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ booking });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/:id
 * Update booking
 */
export const updateBooking = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, cancelReason, feedback, sessionNotes } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (status === 'cancelled') {
      if (booking.studentId !== userId && booking.counsellorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      booking.status = 'cancelled';
      booking.cancelledBy = booking.studentId === userId ? 'student' : 'counsellor';
      booking.cancellationReason = cancelReason;
      booking.cancelledAt = new Date();
    }

    if (feedback && booking.studentId === userId) {
      booking.studentFeedback = {
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: new Date()
      };
    }

    await booking.save();

    res.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/counsellors/available
 * Get available counsellors
 */
export const getAvailableCounsellors = async (req, res, next) => {
  try {
    const { specialization, language } = req.query;

    const query = {
      role: 'counsellor',
      'counsellorProfile.verified': true,
      isActive: true
    };

    if (specialization) {
      query['counsellorProfile.specializations'] = specialization;
    }

    if (language) {
      query['counsellorProfile.languages'] = language;
    }

    let counsellors = await User.find(query)
      .select('clerkId name counsellorProfile email')
      .lean();

    // Fallback default list if database has no verified counsellors yet
    if (!counsellors || counsellors.length === 0) {
      counsellors = [
        {
          clerkId: 'c1',
          name: 'Dr. Sarah Sharma',
          email: 'sarah@waypoint.org',
          counsellorProfile: {
            specializations: ['Anxiety', 'Academic Stress', 'Mindfulness'],
            languages: ['English', 'Hindi'],
            averageRating: 4.9,
            totalSessions: 120,
            bio: 'Experienced student mental health specialist.'
          }
        },
        {
          clerkId: 'c2',
          name: 'Dr. Rajesh Patel',
          email: 'rajesh@waypoint.org',
          counsellorProfile: {
            specializations: ['Depression', 'Relationships', 'Career Anxiety'],
            languages: ['English', 'Hindi', 'Gujarati'],
            averageRating: 4.8,
            totalSessions: 95,
            bio: 'Dedicated counselor for youth and college students.'
          }
        }
      ];
    }

    res.json({ counsellors });

  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  requestMatch,
  getBookings,
  getBookingById,
  updateBooking,
  getAvailableCounsellors
};

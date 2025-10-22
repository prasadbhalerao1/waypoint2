/**
 * Booking Controller
 * Manages counsellor appointment bookings
 */

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { encryptObject, decryptObject } from '../utils/encryption.js';
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

    const { counsellorId, start, end, consentGiven, reason, screeningData, studentEmail, studentName } = req.body;

    // Validate required fields
    if (!counsellorId || !start || !end || !studentEmail || consentGiven === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: counsellorId, start, end, studentEmail, consentGiven' 
      });
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

    if (startDate < new Date()) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }

    // Check if counsellor exists and is verified
    const counsellor = await User.findOne({ 
      clerkId: counsellorId, 
      role: 'counsellor',
      'counsellorProfile.verified': true,
      isActive: true
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found or not verified' });
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

    // Update counsellor's total sessions count
    counsellor.counsellorProfile.totalSessions = 
      (counsellor.counsellorProfile.totalSessions || 0) + 1;
    await counsellor.save();

    // Send email confirmation
    try {
      // Use email from request body, or fall back to Clerk user's email
      const emailToUse = studentEmail || (await clerkClient.users.getUser(userId))?.emailAddresses?.[0]?.emailAddress;
      
      if (!emailToUse) {
        console.warn('⚠️ No email address found in request or for userId:', userId, '- skipping confirmation email');
      } else {
        await sendBookingConfirmation({
          studentEmail: emailToUse,
          counsellorName: counsellor.counsellorProfile?.name || 'Professional Counselor',
          start: booking.start,
          end: booking.end,
          bookingId: booking._id.toString()
        });
        console.log(`✅ Booking confirmation email sent to ${emailToUse}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError?.message || emailError);
      // Don't fail the booking if email fails
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
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let query = {};

    // Students see their own bookings
    if (user.role === 'student') {
      query.studentId = userId;
    }
    // Counsellors see bookings assigned to them
    else if (user.role === 'counsellor') {
      query.counsellorId = userId;
    }
    // Admins can see all bookings (anonymized)
    else if (user.role === 'admin' || user.role === 'super_admin') {
      // Admin query handled separately
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, upcoming } = req.query;

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.start = { $gte: new Date() };
    }

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

    // Check authorization
    const user = await User.findOne({ clerkId: userId });
    
    if (booking.studentId !== userId && 
        booking.counsellorId !== userId && 
        user.role !== 'admin' && 
        user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ booking });

  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/:id
 * Update booking (cancel, reschedule, add feedback)
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

    const user = await User.findOne({ clerkId: userId });

    // Cancel booking
    if (status === 'cancelled') {
      if (booking.studentId !== userId && booking.counsellorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      booking.status = 'cancelled';
      booking.cancelledBy = booking.studentId === userId ? 'student' : 'counsellor';
      booking.cancellationReason = cancelReason;
      booking.cancelledAt = new Date();
    }

    // Add student feedback
    if (feedback && booking.studentId === userId) {
      booking.studentFeedback = {
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: new Date()
      };

      // Update counsellor's average rating
      if (feedback.rating) {
        const counsellor = await User.findOne({ clerkId: booking.counsellorId });
        if (counsellor) {
          const allBookings = await Booking.find({ 
            counsellorId: booking.counsellorId,
            'studentFeedback.rating': { $exists: true }
          });
          
          const totalRating = allBookings.reduce((sum, b) => sum + (b.studentFeedback?.rating || 0), 0);
          counsellor.counsellorProfile.averageRating = totalRating / allBookings.length;
          await counsellor.save();
        }
      }
    }

    // Add counsellor notes (encrypted)
    if (sessionNotes && booking.counsellorId === userId) {
      booking.sessionNotes = encryptObject(sessionNotes);
      booking.counsellorFeedback = {
        followUpNeeded: sessionNotes.followUpNeeded || false,
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

    const counsellors = await User.find(query)
      .select('clerkId name counsellorProfile email')
      .lean();

    res.json({ counsellors });

  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  getAvailableCounsellors
};

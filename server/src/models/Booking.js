/**
 * Booking Model
 * Manages counsellor appointment bookings
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Student (Clerk ID)
  studentId: {
    type: String,
    required: true,
    index: true
  },
  
  // Counsellor (Clerk ID)
  counsellorId: {
    type: String,
    required: true,
    index: true
  },
  
  // Appointment time
  start: {
    type: Date,
    required: true,
    index: true
  },
  
  end: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  
  // Consent to share context
  consentGiven: {
    type: Boolean,
    required: true
  },
  
  // Encrypted payload (PHQ/GAD scores, chat summary if consented)
  encryptedPayload: {
    type: String,
    select: false // Don't include by default
  },
  
  // Booking metadata
  reason: String,
  
  preferredLanguage: String,
  
  // Session notes (encrypted, counsellor only)
  sessionNotes: {
    type: String,
    select: false
  },
  
  // Feedback
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  
  counsellorFeedback: {
    followUpNeeded: Boolean,
    notes: String,
    submittedAt: Date
  },
  
  // Cancellation
  cancelledBy: {
    type: String,
    enum: ['student', 'counsellor', 'admin']
  },
  
  cancellationReason: String,
  
  cancelledAt: Date,
  
  // Reminders sent
  remindersSent: [{
    type: { type: String, enum: ['email', 'sms', 'push'] },
    sentAt: Date
  }]
}, {
  timestamps: true
});

// Compound indexes for conflict checking
bookingSchema.index({ counsellorId: 1, start: 1, end: 1 });
bookingSchema.index({ studentId: 1, start: 1 });
bookingSchema.index({ status: 1, start: 1 });

// Static method to check for conflicts
bookingSchema.statics.hasConflict = async function(counsellorId, start, end, excludeId = null) {
  const query = {
    counsellorId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      // New booking starts during existing booking
      { start: { $lte: start }, end: { $gt: start } },
      // New booking ends during existing booking
      { start: { $lt: end }, end: { $gte: end } },
      // New booking completely contains existing booking
      { start: { $gte: start }, end: { $lte: end } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflict = await this.findOne(query);
  return !!conflict;
};

// Virtual for duration in minutes
bookingSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.end - this.start) / (1000 * 60));
});

export default mongoose.model('Booking', bookingSchema);

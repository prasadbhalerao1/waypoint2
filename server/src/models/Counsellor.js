/**
 * Counsellor Model (deprecated - merged into User model)
 * Kept for backward compatibility
 * Use User model with role='counsellor' instead
 */

import mongoose from 'mongoose';

const counsellorSchema = new mongoose.Schema({
  // Clerk user ID
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Profile
  name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true
  },
  
  phone: String,
  
  // Specializations
  specializations: [{
    type: String,
    enum: ['stress', 'anxiety', 'depression', 'relationships', 'academic', 'trauma', 'grief', 'general']
  }],
  
  // Languages spoken
  languages: [{
    type: String,
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa']
  }],
  
  // Credentials
  credentials: {
    degree: String,
    license: String,
    certifications: [String],
    experience: Number // years
  },
  
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: String // Admin Clerk ID
  },
  
  verifiedAt: Date,
  
  // Bio
  bio: String,
  
  // Availability
  availability: [{
    day: {
      type: String,
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    slots: [{
      start: String, // HH:MM format
      end: String
    }]
  }],
  
  // Institution
  institution: String,
  
  // Performance metrics
  totalSessions: {
    type: Number,
    default: 0
  },
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
counsellorSchema.index({ verified: 1, isActive: 1 });
counsellorSchema.index({ specializations: 1 });
counsellorSchema.index({ languages: 1 });
counsellorSchema.index({ institution: 1 });

export default mongoose.model('Counsellor', counsellorSchema);

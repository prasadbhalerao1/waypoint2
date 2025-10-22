/**
 * User Model
 * Stores user profile, preferences, gamification data
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Clerk user ID (primary identifier)
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin', 'super_admin'],
    default: 'student'
  },
  
  // Profile information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    sparse: true
  },
  
  name: String,
  
  // Student-specific fields
  course: String,
  year: Number,
  institution: String,
  
  // Preferences
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa']
  },
  
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'home_ground', 'studio', 'library', 'calm', 'focus', 'sleep']
  },
  
  // Gamification
  xp: {
    type: Number,
    default: 0
  },
  
  level: {
    type: Number,
    default: 1
  },
  
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date,
    freezeTokens: { type: Number, default: 0 }
  },
  
  badges: [{
    badgeId: String,
    earnedAt: Date,
    name: String,
    icon: String
  }],
  
  // Current mood (1-5 scale)
  currentMood: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  lastMoodUpdate: Date,
  
  // Onboarding & consent
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  
  consents: {
    screenings: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    counsellorSharing: { type: Boolean, default: false },
    timestamp: Date
  },
  
  // Privacy settings
  dataRetention: {
    type: String,
    enum: ['1_month', '3_months', '6_months', '1_year', 'indefinite'],
    default: '6_months'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Counsellor-specific fields
  counsellorProfile: {
    specializations: [String],
    languages: [String],
    credentials: String,
    verified: { type: Boolean, default: false },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedAt: Date,
    bio: String,
    experience: Number,
    availability: [{
      day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      slots: [{ start: String, end: String }]
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ institution: 1 });
userSchema.index({ 'counsellorProfile.verified': 1 });

// Virtual for progress percentage
userSchema.virtual('progressPercentage').get(function() {
  const xpForNextLevel = this.level * 100;
  return Math.min(100, (this.xp / xpForNextLevel) * 100);
});

// Method to add XP and level up
userSchema.methods.addXP = function(points) {
  this.xp += points;
  const xpForNextLevel = this.level * 100;
  
  if (this.xp >= xpForNextLevel) {
    this.level += 1;
    this.xp -= xpForNextLevel;
  }
  
  return this.save();
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.streak.lastActivity;
  
  if (!lastActivity) {
    this.streak.current = 1;
    this.streak.lastActivity = now;
  } else {
    const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity === 0) {
      // Same day, no change
      return this.save();
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day
      this.streak.current += 1;
      this.streak.lastActivity = now;
      
      if (this.streak.current > this.streak.longest) {
        this.streak.longest = this.streak.current;
      }
    } else if (daysSinceLastActivity === 2 && this.streak.freezeTokens > 0) {
      // Grace period with freeze token
      this.streak.freezeTokens -= 1;
      this.streak.lastActivity = now;
    } else {
      // Streak broken
      this.streak.current = 1;
      this.streak.lastActivity = now;
    }
  }
  
  return this.save();
};

export default mongoose.model('User', userSchema);

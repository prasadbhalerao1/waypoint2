/**
 * Resource Model
 * Multimedia mental health resources
 */

import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  // Resource metadata
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Resource type
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'audio', 'exercise', 'worksheet', 'infographic', 'module']
  },
  
  // Content URL or file path
  url: {
    type: String,
    required: true
  },
  
  // Thumbnail image
  thumbnail: String,
  
  // Language
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa']
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Theme association
  themes: [{
    type: String,
    enum: ['default', 'home_ground', 'studio', 'library', 'calm', 'focus', 'sleep', 'all']
  }],
  
  // Categories
  category: {
    type: String,
    enum: ['stress', 'anxiety', 'depression', 'sleep', 'relationships', 'academic', 'general', 'crisis']
  },
  
  // Difficulty/intensity level
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Duration (for videos, audio, exercises)
  duration: Number, // in minutes
  
  // XP reward for completion
  xpReward: {
    type: Number,
    default: 0
  },
  
  // Access control
  accessLevel: {
    type: String,
    enum: ['public', 'verified', 'premium'],
    default: 'public'
  },
  
  // Content metadata
  author: String,
  source: String,
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  completions: {
    type: Number,
    default: 0
  },
  
  // Moderation
  isPublished: {
    type: Boolean,
    default: true
  },
  
  publishedAt: Date,
  
  // Admin who created/approved
  createdBy: String, // Clerk ID
  
  approvedBy: String, // Clerk ID
  
  // Institution-specific
  institution: String,
  
  // Featured/promoted
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  featuredUntil: Date
}, {
  timestamps: true
});

// Indexes for search and filtering
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ type: 1, language: 1 });
resourceSchema.index({ category: 1, isPublished: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ themes: 1 });
resourceSchema.index({ isFeatured: 1, featuredUntil: 1 });

// Method to increment view count
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

export default mongoose.model('Resource', resourceSchema);

/**
 * ForumPost Model
 * Peer support forum posts
 */

import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
  // Author (can be null if anonymous)
  authorId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Anonymous posting
  anonymous: {
    type: Boolean,
    default: false
  },
  
  // Pseudonym for anonymous posts
  pseudonym: String,
  
  // Username for non-anonymous posts
  username: String,
  
  // Post content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Category/topic
  category: {
    type: String,
    enum: ['general', 'stress', 'anxiety', 'academic', 'relationships', 'success_stories', 'tips', 'questions'],
    default: 'general'
  },
  
  // Tags
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Engagement
  likes: {
    type: Number,
    default: 0
  },
  
  likedBy: [{
    type: String // Clerk IDs
  }],
  
  views: {
    type: Number,
    default: 0
  },
  
  // Comments count (denormalized for performance)
  commentsCount: {
    type: Number,
    default: 0
  },
  
  // Moderation
  flags: {
    type: Number,
    default: 0
  },
  
  flaggedBy: [{
    userId: String,
    reason: String,
    timestamp: Date
  }],
  
  reviewRequired: {
    type: Boolean,
    default: false
  },
  
  isApproved: {
    type: Boolean,
    default: true
  },
  
  moderatedBy: String, // Clerk ID
  
  moderatedAt: Date,
  
  moderationNotes: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  isLocked: {
    type: Boolean,
    default: false
  },
  
  // Institution-specific
  institution: String
}, {
  timestamps: true
});

// Indexes
forumPostSchema.index({ category: 1, isActive: 1, createdAt: -1 });
forumPostSchema.index({ authorId: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ isPinned: 1, createdAt: -1 });
forumPostSchema.index({ reviewRequired: 1 });
forumPostSchema.index({ title: 'text', content: 'text' });

// Method to add flag
forumPostSchema.methods.addFlag = function(userId, reason) {
  this.flags += 1;
  this.flaggedBy.push({ userId, reason, timestamp: new Date() });
  
  // Auto-moderation rule: if flags > 3, mark for review
  if (this.flags > 3) {
    this.reviewRequired = true;
  }
  
  return this.save();
};

// Method to toggle like
forumPostSchema.methods.toggleLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    // Unlike
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    // Like
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  return this.save();
};

export default mongoose.model('ForumPost', forumPostSchema);

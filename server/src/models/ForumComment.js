/**
 * ForumComment Model
 * Comments on forum posts
 */

import mongoose from 'mongoose';

const forumCommentSchema = new mongoose.Schema({
  // Post reference
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true,
    index: true
  },
  
  // Author (can be null if anonymous)
  authorId: {
    type: String,
    sparse: true
  },
  
  // Anonymous commenting
  anonymous: {
    type: Boolean,
    default: false
  },
  
  pseudonym: String,
  
  // Username for non-anonymous comments
  username: String,
  
  // Comment content
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Engagement
  likes: {
    type: Number,
    default: 0
  },
  
  likedBy: [{
    type: String
  }],
  
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
  
  isApproved: {
    type: Boolean,
    default: true
  },
  
  moderatedBy: String,
  
  moderatedAt: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
forumCommentSchema.index({ postId: 1, createdAt: 1 });
forumCommentSchema.index({ authorId: 1, createdAt: -1 });

// Method to toggle like
forumCommentSchema.methods.toggleLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  return this.save();
};

export default mongoose.model('ForumComment', forumCommentSchema);

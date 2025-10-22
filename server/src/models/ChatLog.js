/**
 * ChatLog Model
 * Stores chat interactions with PII redacted
 */

import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema({
  // User reference (Clerk ID)
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Message content (PII redacted before storage)
  message: {
    type: String,
    required: true
  },
  
  // AI response
  reply: {
    type: String,
    required: true
  },
  
  // Sentiment analysis (-1 to 1, or 0 if not analyzed)
  sentiment: {
    type: Number,
    default: 0,
    min: -1,
    max: 1
  },
  
  // Crisis/escalation flag
  escalate: {
    type: Boolean,
    default: false
  },
  
  // Escalation actions suggested
  escalationActions: [{
    type: String,
    enum: ['call_helpline', 'book_counsellor', 'emergency_contact', 'crisis_resources']
  }],
  
  // RAG sources used for response
  sources: [{
    type: String
  }],
  
  // User context at time of chat
  mood: {
    type: Number,
    min: 1,
    max: 5
  },
  
  theme: String,
  
  // Metadata
  responseTime: Number, // milliseconds
  
  usedAI: {
    type: Boolean,
    default: false
  },
  
  // Session grouping
  sessionId: String,
  
  // Anonymized for analytics
  anonymized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
chatLogSchema.index({ userId: 1, createdAt: -1 });
chatLogSchema.index({ escalate: 1, createdAt: -1 });
chatLogSchema.index({ sessionId: 1 });
chatLogSchema.index({ createdAt: -1 });

// Static method to get sentiment average for user
chatLogSchema.statics.getAverageSentiment = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate },
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
  
  return result.length > 0 ? result[0] : { avgSentiment: 0, count: 0 };
};

export default mongoose.model('ChatLog', chatLogSchema);

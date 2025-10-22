/**
 * Screening Model
 * PHQ-9 and GAD-7 screening assessments
 */

import mongoose from 'mongoose';

const screeningSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['PHQ-9', 'GAD-7'],
    required: true
  },
  responses: [{
    question: String,
    score: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'],
    required: true
  },
  flagged: {
    type: Boolean,
    default: false
  },
  suicidalIdeation: {
    type: Boolean,
    default: false
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for analytics queries
screeningSchema.index({ createdAt: -1 });
screeningSchema.index({ userId: 1, createdAt: -1 });
screeningSchema.index({ flagged: 1 });

export default mongoose.model('Screening', screeningSchema);

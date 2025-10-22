/**
 * Consent Model
 * Granular consent tracking for data usage
 */

import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Consent scopes
  scopes: {
    screenings: {
      granted: { type: Boolean, default: false },
      timestamp: Date
    },
    analytics: {
      granted: { type: Boolean, default: false },
      timestamp: Date
    },
    counsellorSharing: {
      granted: { type: Boolean, default: false },
      timestamp: Date
    },
    research: {
      granted: { type: Boolean, default: false },
      timestamp: Date
    },
    marketing: {
      granted: { type: Boolean, default: false },
      timestamp: Date
    }
  },
  
  // Encrypted payload (only stored if consent given)
  // Contains sensitive data like PHQ/GAD answers
  encryptedPayload: {
    type: String,
    select: false
  },
  
  // Metadata
  ipAddress: String,
  
  userAgent: String,
  
  // Withdrawal
  withdrawnAt: Date,
  
  withdrawalReason: String,
  
  // Version tracking (for consent form changes)
  consentVersion: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

// Indexes
consentSchema.index({ userId: 1, createdAt: -1 });

// Method to update consent
consentSchema.methods.updateConsent = function(scope, granted) {
  if (!this.scopes[scope]) {
    throw new Error(`Invalid consent scope: ${scope}`);
  }
  
  this.scopes[scope].granted = granted;
  this.scopes[scope].timestamp = new Date();
  
  return this.save();
};

// Method to withdraw all consents
consentSchema.methods.withdrawAll = function(reason) {
  Object.keys(this.scopes).forEach(scope => {
    this.scopes[scope].granted = false;
  });
  
  this.withdrawnAt = new Date();
  this.withdrawalReason = reason;
  
  return this.save();
};

export default mongoose.model('Consent', consentSchema);

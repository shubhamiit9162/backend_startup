
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxLength: 20
  },
  company: {
    type: String,
    trim: true,
    maxLength: 100
  },
  serviceType: {
    type: String,
    required: true,
    trim: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  actualDate: {
    type: Date
  },
  actualTime: {
    type: String
  },
  notes: {
    type: String,
    maxLength: 2000
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
scheduleSchema.index({ email: 1, preferredDate: 1 });
scheduleSchema.index({ preferredDate: 1, status: 1 });
scheduleSchema.index({ status: 1 });

// Prevent double booking for same time slot
scheduleSchema.index({ 
  preferredDate: 1, 
  preferredTime: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

module.exports = mongoose.model('Schedule', scheduleSchema);

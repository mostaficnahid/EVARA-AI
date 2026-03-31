const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, trim: true, maxlength: 2000 },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, default: '09:00' },
  venue: {
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: 'USA' },
    capacity: { type: Number },
  },
  category: {
    type: String,
    enum: ['Conference', 'Gala', 'Workshop', 'Product Launch', 'Networking', 'Corporate', 'Other'],
    default: 'Conference',
  },
  status: {
    type: String,
    enum: ['draft', 'planning', 'confirmed', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'planning',
  },
  expectedGuests: { type: Number, default: 0 },
  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  agenda: [{
    time: String,
    title: String,
    speaker: String,
    duration: Number, // minutes
  }],
  tags: [String],
  color: { type: String, default: '#5b8def' },
  coverImage: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  aiGenerated: { type: Boolean, default: false },
}, { timestamps: true });

eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);

const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String },
  company: { type: String },
  role: {
    type: String,
    enum: ['Attendee', 'Speaker', 'Panelist', 'VIP', 'Sponsor', 'Press', 'Facilitator', 'Executive', 'Other'],
    default: 'Attendee',
  },
  rsvp: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Declined', 'Waitlisted'],
    default: 'Pending',
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  dietary: { type: String },
  notes: { type: String },
  avatar: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

guestSchema.index({ email: 1 }, { unique: true });
guestSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Guest', guestSchema);

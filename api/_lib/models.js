// api/_lib/models.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── User ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  organization: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ── Event ─────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, trim: true, maxlength: 2000 },
  date:        { type: Date, required: true },
  time:        { type: String, default: '09:00' },
  venue: {
    name:     { type: String, required: true },
    address:  String,
    city:     String,
    country:  { type: String, default: 'USA' },
    capacity: Number,
  },
  category: {
    type: String,
    enum: ['Conference','Gala','Workshop','Product Launch','Networking','Corporate','Other'],
    default: 'Conference',
  },
  status: {
    type: String,
    enum: ['draft','planning','confirmed','upcoming','ongoing','completed','cancelled'],
    default: 'planning',
  },
  expectedGuests: { type: Number, default: 0 },
  budget: {
    total:    { type: Number, default: 0 },
    spent:    { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  agenda: [{ time: String, title: String, speaker: String, duration: Number }],
  tags:       [String],
  color:      { type: String, default: '#5b8def' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guests:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  aiGenerated:{ type: Boolean, default: false },
}, { timestamps: true });

// ── Guest ─────────────────────────────────────────────────────────
const guestSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  phone:   String,
  company: String,
  role: {
    type: String,
    enum: ['Attendee','Speaker','Panelist','VIP','Sponsor','Press','Facilitator','Executive','Other'],
    default: 'Attendee',
  },
  rsvp: {
    type: String,
    enum: ['Pending','Confirmed','Declined','Waitlisted'],
    default: 'Pending',
  },
  events:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  dietary:   String,
  notes:     String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

guestSchema.index({ email: 1, createdBy: 1 }, { unique: false });

// Guard against model re-registration in hot-reload environments
export const User  = mongoose.models.User  || mongoose.model('User',  userSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);

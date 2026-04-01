// api/guests/index.js
import { connectDB }   from '../_lib/db.js';
import { Guest, Event } from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    // ── GET ────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { rsvp, role, event, search, page = 1, limit = 50 } = req.query;
      const filter = { createdBy: user._id };
      if (rsvp)   filter.rsvp   = rsvp;
      if (role)   filter.role   = role;
      if (event)  filter.events = event;
      if (search) filter.$or    = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];

      const total  = await Guest.countDocuments(filter);
      const guests = await Guest.find(filter)
        .populate('events', 'name date status')
        .sort({ name: 1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);

      return res.json({ guests, total });
    }

    // ── POST ───────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { eventId, ...guestData } = req.body;
      const guest = await Guest.create({ ...guestData, createdBy: user._id });
      if (eventId) {
        await Event.findByIdAndUpdate(eventId, { $addToSet: { guests: guest._id } });
      }
      return res.status(201).json(guest);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

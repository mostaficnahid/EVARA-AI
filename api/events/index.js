// api/events/index.js
import { connectDB }   from '../_lib/db.js';
import { Event }       from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    // ── GET — list events ──────────────────────────────────────
    if (req.method === 'GET') {
      const { status, category, search, page = 1, limit = 20 } = req.query;
      const filter = { createdBy: user._id };
      if (status)   filter.status   = status;
      if (category) filter.category = category;
      if (search)   filter.name     = { $regex: search, $options: 'i' };

      const total  = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .populate('guests', 'name email rsvp')
        .sort({ date: 1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);

      return res.json({ events, total, page: +page, pages: Math.ceil(total / +limit) });
    }

    // ── POST — create event ────────────────────────────────────
    if (req.method === 'POST') {
      const event = await Event.create({ ...req.body, createdBy: user._id });
      return res.status(201).json(event);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

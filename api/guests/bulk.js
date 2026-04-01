// api/guests/bulk.js
import { connectDB }    from '../_lib/db.js';
import { Guest, Event } from '../_lib/models.js';
import { requireAuth }  from '../_lib/auth.js';
import { handleCors }   from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const { guests, eventId } = req.body;
    if (!Array.isArray(guests) || guests.length === 0)
      return res.status(400).json({ error: 'Provide a non-empty guests array' });

    const created = await Guest.insertMany(
      guests.map(g => ({ ...g, createdBy: user._id })),
      { ordered: false }
    );

    if (eventId) {
      const ids = created.map(g => g._id);
      await Event.findByIdAndUpdate(eventId, { $addToSet: { guests: { $each: ids } } });
    }

    res.status(201).json({ created: created.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

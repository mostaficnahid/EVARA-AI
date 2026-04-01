// api/events/[id].js
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

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Event ID required' });

    // ── GET ────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const event = await Event.findOne({ _id: id, createdBy: user._id }).populate('guests');
      if (!event) return res.status(404).json({ error: 'Event not found' });
      return res.json(event);
    }

    // ── PUT ────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const event = await Event.findOneAndUpdate(
        { _id: id, createdBy: user._id },
        req.body,
        { new: true, runValidators: true }
      );
      if (!event) return res.status(404).json({ error: 'Event not found' });
      return res.json(event);
    }

    // ── DELETE ─────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const event = await Event.findOneAndDelete({ _id: id, createdBy: user._id });
      if (!event) return res.status(404).json({ error: 'Event not found' });
      return res.json({ message: 'Event deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

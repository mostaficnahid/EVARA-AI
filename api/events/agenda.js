// api/events/agenda.js  — POST /api/events/:id/agenda
import { connectDB }   from '../_lib/db.js';
import { Event }       from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;
    const event = await Event.findOne({ _id: id, createdBy: user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.agenda.push(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

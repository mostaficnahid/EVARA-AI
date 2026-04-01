// api/guests/[id].js
import { connectDB }   from '../_lib/db.js';
import { Guest }       from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    // ── PUT ────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const guest = await Guest.findOneAndUpdate(
        { _id: id, createdBy: user._id },
        req.body,
        { new: true }
      );
      if (!guest) return res.status(404).json({ error: 'Guest not found' });
      return res.json(guest);
    }

    // ── DELETE ─────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const guest = await Guest.findOneAndDelete({ _id: id, createdBy: user._id });
      if (!guest) return res.status(404).json({ error: 'Guest not found' });
      return res.json({ message: 'Guest removed' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

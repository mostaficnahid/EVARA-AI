// api/auth/me.js
import { connectDB }   from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

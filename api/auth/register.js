// api/auth/register.js
import { connectDB } from '../_lib/db.js';
import { User }      from '../_lib/models.js';
import { signToken } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { name, email, password, organization } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password, organization });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// api/_lib/auth.js
import jwt from 'jsonwebtoken';
import { User } from './models.js';

/**
 * Verifies the Bearer token from the Authorization header.
 * Returns the user document or throws with status 401.
 */
export async function requireAuth(req, res) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
    return null;
  }
}

export function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// api/health.js
import { handleCors } from './_lib/cors.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

// api/ai/suggest-venues.js
import Anthropic       from '@anthropic-ai/sdk';
import { connectDB }   from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const { city, guests, category, budget } = req.body;
    if (!city) return res.status(400).json({ error: 'city is required' });

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 900,
      system: `You are an expert event venue consultant.
Suggest 4 real or realistic event venues. Return ONLY a valid JSON array — no markdown, no extra text:
[{
  "name": "Venue Name",
  "address": "Street address",
  "city": "City",
  "capacity": 500,
  "priceRange": "$$$",
  "pros": ["Great AV setup", "Central location"],
  "bestFor": "Large conferences"
}]`,
      messages: [{
        role:    'user',
        content: `Suggest 4 venues in ${city} for a ${category || 'professional event'} with ${guests || 100} guests and a budget of $${budget || 50000}.`,
      }],
    });

    const raw    = response.content[0].text.replace(/```json|```/g, '').trim();
    const venues = JSON.parse(raw);
    res.json({ venues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

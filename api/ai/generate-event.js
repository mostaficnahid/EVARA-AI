// api/ai/generate-event.js
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

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are an expert event planner. Generate complete event details based on the user's description.
Return ONLY valid JSON — no markdown fences, no extra text — with exactly these fields:
{
  "name": "Event Name",
  "description": "2-3 sentence description",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "venue": { "name": "Venue Name", "address": "Street address", "city": "City", "country": "Country", "capacity": 0 },
  "category": "Conference|Gala|Workshop|Product Launch|Networking|Corporate|Other",
  "expectedGuests": 0,
  "budget": { "total": 0, "spent": 0, "currency": "USD" },
  "agenda": [{ "time": "HH:MM", "title": "Session title", "speaker": "Name or TBD", "duration": 60 }],
  "tags": ["tag1", "tag2"],
  "color": "#hexcolor"
}`,
      messages: [{ role: 'user', content: `Generate event details for: "${prompt}"` }],
    });

    const raw    = response.content[0].text.replace(/```json|```/g, '').trim();
    const data   = JSON.parse(raw);
    data.aiGenerated = true;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// api/ai/generate-agenda.js
import Anthropic       from '@anthropic-ai/sdk';
import { connectDB }   from '../_lib/db.js';
import { Event }       from '../_lib/models.js';
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

    const { eventId, duration = 8, focus } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const event = await Event.findOne({ _id: eventId, createdBy: user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a professional event planner.
Generate a realistic event agenda. Return ONLY a valid JSON array — no markdown, no extra text:
[{ "time": "09:00", "title": "Session name", "speaker": "Name or TBD", "duration": 60 }]`,
      messages: [{
        role:    'user',
        content: `Create a ${duration}-hour agenda for: "${event.name}" (${event.category})
with ${event.expectedGuests} guests. Focus: ${focus || 'general programme'}.
Start time: ${event.time || '09:00'}. Include welcome, keynotes, breaks, networking, and closing.`,
      }],
    });

    const raw   = response.content[0].text.replace(/```json|```/g, '').trim();
    const agenda = JSON.parse(raw);
    res.json({ agenda });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

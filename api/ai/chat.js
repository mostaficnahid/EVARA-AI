// api/ai/chat.js
import Anthropic       from '@anthropic-ai/sdk';
import { connectDB }   from '../_lib/db.js';
import { Event }       from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_SYSTEM = `You are Evara AI, a sophisticated event planning and management assistant.
You specialise in conferences, galas, workshops, product launches, corporate events, and networking gatherings.
You give actionable, specific, professional advice on venues, catering, logistics, agendas, budgeting,
guest management, marketing, and post-event analysis.
Be concise, warm, and highly knowledgeable. Format with short paragraphs; use bullet points only for lists.`;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const { messages, eventContext } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: 'messages array is required' });

    let system = BASE_SYSTEM;
    if (eventContext) {
      system += `\n\nCurrent event context:\n${JSON.stringify(eventContext, null, 2)}`;
    } else {
      const events = await Event.find({ createdBy: user._id })
        .select('name date venue category status expectedGuests budget')
        .sort({ date: 1 })
        .limit(8);
      if (events.length)
        system += `\n\nUser's upcoming events:\n${JSON.stringify(events, null, 2)}`;
    }

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    });

    res.json({ reply: response.content[0].text, usage: response.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

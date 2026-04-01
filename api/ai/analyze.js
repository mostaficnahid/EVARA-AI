// api/ai/analyze.js
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

    const events = await Event.find({ createdBy: user._id })
      .select('name date category status expectedGuests budget')
      .sort({ date: -1 })
      .limit(20);

    if (events.length === 0)
      return res.json({ analysis: "You don't have any events yet. Create your first event and I'll analyse your portfolio!" });

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `You are Evara AI, an expert event portfolio analyst. Be concise, specific, and actionable.`,
      messages: [{
        role:    'user',
        content: `Analyse my event portfolio and give me:
1. Top 2 strengths
2. Top 2 areas to improve
3. Three concrete recommendations for the next quarter

Portfolio data:
${JSON.stringify(events, null, 2)}`,
      }],
    });

    res.json({ analysis: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

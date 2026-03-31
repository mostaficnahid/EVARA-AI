const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AI_SYSTEM = `You are Evara AI, an expert event planning and management assistant. 
You specialize in planning conferences, galas, workshops, product launches, corporate events, and networking events.
You provide actionable, specific, professional advice covering: venues, catering, logistics, agendas, budgeting, 
guest management, marketing, and post-event analysis. 
Be concise, warm, and highly knowledgeable. Format responses in clear paragraphs with occasional bullet points for lists.`;

// POST /api/ai/chat — streaming-compatible chat
router.post('/chat', async (req, res) => {
  try {
    const { messages, eventContext } = req.body;

    // Inject user's event context
    let systemWithContext = AI_SYSTEM;
    if (eventContext) {
      systemWithContext += `\n\nCurrent event context:\n${JSON.stringify(eventContext, null, 2)}`;
    } else {
      // Load user's recent events
      const events = await Event.find({ createdBy: req.user._id })
        .select('name date venue category status expectedGuests budget')
        .sort({ date: 1 })
        .limit(10);
      if (events.length) {
        systemWithContext += `\n\nUser's events:\n${JSON.stringify(events, null, 2)}`;
      }
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    res.json({ reply: response.content[0].text, usage: response.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-event — AI generates full event details
router.post('/generate-event', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are an expert event planner. Generate complete event details based on the user's description.
Return ONLY valid JSON with these fields:
{
  "name": "Event Name",
  "description": "2-3 sentence description",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "venue": { "name": "Venue Name", "address": "Address", "city": "City", "country": "Country", "capacity": 0 },
  "category": "Conference|Gala|Workshop|Product Launch|Networking|Corporate|Other",
  "expectedGuests": 0,
  "budget": { "total": 0, "spent": 0, "currency": "USD" },
  "agenda": [{ "time": "HH:MM", "title": "Session title", "speaker": "Name", "duration": 60 }],
  "tags": ["tag1", "tag2"],
  "color": "#hex"
}`,
      messages: [{ role: 'user', content: `Generate event details for: ${prompt}` }],
    });

    let text = response.content[0].text.replace(/```json|```/g, '').trim();
    const eventData = JSON.parse(text);
    eventData.aiGenerated = true;
    res.json(eventData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-agenda — AI generates agenda for an event
router.post('/generate-agenda', async (req, res) => {
  try {
    const { eventId, duration, focus } = req.body;
    const event = await Event.findOne({ _id: eventId, createdBy: req.user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Generate a professional event agenda. Return ONLY a JSON array:
[{ "time": "09:00", "title": "Session", "speaker": "Name or TBD", "duration": 60 }]`,
      messages: [{
        role: 'user',
        content: `Create a ${duration || 8}-hour agenda for: "${event.name}" (${event.category}) 
with ${event.expectedGuests} guests. Focus: ${focus || 'general'}. 
Start time: ${event.time || '09:00'}.`,
      }],
    });

    let text = response.content[0].text.replace(/```json|```/g, '').trim();
    const agenda = JSON.parse(text);
    res.json({ agenda });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/suggest-venues — AI suggests venues
router.post('/suggest-venues', async (req, res) => {
  try {
    const { city, guests, category, budget } = req.body;
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `Suggest event venues. Return ONLY a JSON array:
[{ "name": "Venue", "address": "Address", "city": "City", "capacity": 500, "priceRange": "$$$", "pros": ["pro1"], "bestFor": "type" }]`,
      messages: [{
        role: 'user',
        content: `Suggest 4 venues in ${city} for a ${category} with ${guests} guests and $${budget} budget.`,
      }],
    });

    let text = response.content[0].text.replace(/```json|```/g, '').trim();
    const venues = JSON.parse(text);
    res.json({ venues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/analyze — AI analyzes event portfolio
router.post('/analyze', async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .select('name date category status expectedGuests budget')
      .sort({ date: -1 })
      .limit(20);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: AI_SYSTEM,
      messages: [{
        role: 'user',
        content: `Analyze my event portfolio and provide insights:\n${JSON.stringify(events, null, 2)}\n\nGive me: top strengths, areas to improve, and 3 recommendations.`,
      }],
    });

    res.json({ analysis: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/guests
router.get('/', async (req, res) => {
  try {
    const { rsvp, role, event, search, page = 1, limit = 50 } = req.query;
    const filter = { createdBy: req.user._id };
    if (rsvp) filter.rsvp = rsvp;
    if (role) filter.role = role;
    if (event) filter.events = event;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];

    const total = await Guest.countDocuments(filter);
    const guests = await Guest.find(filter)
      .populate('events', 'name date status')
      .sort({ name: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({ guests, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guests
router.post('/', async (req, res) => {
  try {
    const guest = await Guest.create({ ...req.body, createdBy: req.user._id });
    // Link guest to event if provided
    if (req.body.eventId) {
      await Event.findByIdAndUpdate(req.body.eventId, { $addToSet: { guests: guest._id } });
    }
    res.status(201).json(guest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/guests/:id
router.put('/:id', async (req, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/guests/:id
router.delete('/:id', async (req, res) => {
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guests/bulk — import multiple guests
router.post('/bulk', async (req, res) => {
  try {
    const { guests, eventId } = req.body;
    const created = await Guest.insertMany(
      guests.map(g => ({ ...g, createdBy: req.user._id })),
      { ordered: false }
    );
    if (eventId) {
      const ids = created.map(g => g._id);
      await Event.findByIdAndUpdate(eventId, { $addToSet: { guests: { $each: ids } } });
    }
    res.status(201).json({ created: created.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/events — list all (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, from, to, search, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('guests', 'name email rsvp')
      .sort({ date: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({ events, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, confirmed, upcoming, budgetAgg] = await Promise.all([
      Event.countDocuments({ createdBy: userId }),
      Event.countDocuments({ createdBy: userId, status: 'confirmed' }),
      Event.countDocuments({ createdBy: userId, date: { $gte: new Date() } }),
      Event.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, totalBudget: { $sum: '$budget.total' }, totalSpent: { $sum: '$budget.spent' }, totalGuests: { $sum: '$expectedGuests' } } },
      ]),
    ]);
    const stats = budgetAgg[0] || { totalBudget: 0, totalSpent: 0, totalGuests: 0 };
    res.json({ total, confirmed, upcoming, ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('guests');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/agenda — add agenda item
router.post('/:id/agenda', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.agenda.push(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

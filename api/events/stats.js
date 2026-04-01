// api/events/stats.js
import { connectDB }   from '../_lib/db.js';
import { Event }       from '../_lib/models.js';
import { requireAuth } from '../_lib/auth.js';
import { handleCors }  from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const user = await requireAuth(req, res);
    if (!user) return;

    const userId = user._id;
    const [total, confirmed, upcoming, budgetAgg] = await Promise.all([
      Event.countDocuments({ createdBy: userId }),
      Event.countDocuments({ createdBy: userId, status: 'confirmed' }),
      Event.countDocuments({ createdBy: userId, date: { $gte: new Date() } }),
      Event.aggregate([
        { $match: { createdBy: userId } },
        { $group: {
            _id: null,
            totalBudget: { $sum: '$budget.total' },
            totalSpent:  { $sum: '$budget.spent' },
            totalGuests: { $sum: '$expectedGuests' },
        }},
      ]),
    ]);

    const agg = budgetAgg[0] || { totalBudget: 0, totalSpent: 0, totalGuests: 0 };
    res.json({ total, confirmed, upcoming, ...agg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

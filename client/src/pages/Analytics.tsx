import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEventsStore } from '../store';
import { format } from 'date-fns';

const COLORS_ARRAY = ['#5b8def','#c9a84c','#9b6ee8','#4caf82','#e05252','#f08040'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color: 'var(--text)' }}>{p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? `$${(p.value/1000).toFixed(0)}K` : p.value}</strong></div>)}
    </div>
  );
};

export default function Analytics() {
  const { events, stats, fetchEvents, fetchStats } = useEventsStore();

  useEffect(() => { fetchEvents({ limit: 50 }); fetchStats(); }, []);

  // Category distribution
  const categoryData = Object.entries(
    events.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Status distribution
  const statusData = Object.entries(
    events.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Budget data
  const budgetData = events.filter(e => e.budget?.total > 0).slice(0, 8).map(e => ({
    name: e.name.substring(0, 16) + (e.name.length > 16 ? '…' : ''),
    Total: e.budget.total,
    Spent: e.budget.spent,
  }));

  // Guest data by event
  const guestData = events.slice(0, 8).map(e => ({
    name: e.name.substring(0, 14) + (e.name.length > 14 ? '…' : ''),
    Guests: e.expectedGuests,
  }));

  const statBoxes = [
    { label: 'Total Events', value: stats?.total ?? '—', sub: 'in portfolio' },
    { label: 'Confirmed', value: stats?.confirmed ?? '—', sub: 'events ready' },
    { label: 'Total Guests', value: stats?.totalGuests?.toLocaleString() ?? '—', sub: 'expected' },
    { label: 'Budget Utilization', value: stats?.totalBudget ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}%` : '—', sub: 'of total budget' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-main">Analytics</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Updated {format(new Date(), 'MMM d, yyyy')}</div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {statBoxes.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Category pie */}
        <div className="card">
          <div className="card-title">Events by Category</div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS_ARRAY[i % COLORS_ARRAY.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}>No data</div>}
        </div>

        {/* Status pie */}
        <div className="card">
          <div className="card-title">Events by Status</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS_ARRAY[i % COLORS_ARRAY.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}>No data</div>}
        </div>
      </div>

      {/* Budget bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Budget vs. Spent by Event</div>
        {budgetData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetData} margin={{ left: 10 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Total" fill="var(--gold)" opacity={0.4} radius={[4,4,0,0]} />
              <Bar dataKey="Spent" fill="var(--gold)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state" style={{ padding: 40 }}>No budget data</div>}
      </div>

      {/* Guest bar */}
      <div className="card">
        <div className="card-title">Expected Guests by Event</div>
        {guestData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={guestData}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Guests" fill="var(--blue)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state" style={{ padding: 40 }}>No data</div>}
      </div>
    </div>
  );
}

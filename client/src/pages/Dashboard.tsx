import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store';
import { format } from 'date-fns';

const STATUS_CLASS: Record<string, string> = {
  confirmed: 'badge-confirmed', planning: 'badge-planning',
  upcoming: 'badge-upcoming', draft: 'badge-draft',
  cancelled: 'badge-cancelled', completed: 'badge-completed',
};

export default function Dashboard() {
  const { events, stats, loading, fetchEvents, fetchStats } = useEventsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents({ limit: 8 });
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Events', value: stats?.total ?? '—', accent: 'var(--gold)', change: 'All time' },
    { label: 'Confirmed', value: stats?.confirmed ?? '—', accent: 'var(--green)', change: 'Ready to go' },
    { label: 'Total Guests', value: stats?.totalGuests?.toLocaleString() ?? '—', accent: 'var(--blue)', change: 'Expected' },
    {
      label: 'Budget Used',
      value: stats?.totalBudget ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}%` : '—',
      accent: 'var(--purple)',
      change: stats?.totalBudget ? `$${((stats.totalBudget - stats.totalSpent) / 1000).toFixed(0)}K remaining` : '',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title-main">Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {format(new Date(), "EEEE, MMMM do yyyy")}
          </div>
        </div>
        <button className="btn btn-gold" onClick={() => navigate('/events')}>+ New Event</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((s) => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.accent }} />
            <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--text)' }}>{loading ? '—' : s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="section-header">
        <div className="section-title">Upcoming Events</div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>View All →</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <div className="empty-title">No events yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Create your first event to get started</div>
          <button className="btn btn-gold" onClick={() => navigate('/events')}>Create Event</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((event) => (
            <div
              key={event._id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '14px 18px' }}
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <div style={{ width: 3, height: 48, borderRadius: 2, background: event.color || 'var(--gold)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{event.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                  <span>📅 {format(new Date(event.date), 'MMM d, yyyy')}</span>
                  <span>📍 {event.venue?.name}</span>
                  <span>🏷️ {event.category}</span>
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[event.status] || 'badge-draft'}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>👥 {event.expectedGuests}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

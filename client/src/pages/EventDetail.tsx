import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store';
import { aiAPI } from '../api';
import { format } from 'date-fns';

const STATUS_CLASS: Record<string, string> = { confirmed: 'badge-confirmed', planning: 'badge-planning', upcoming: 'badge-upcoming', draft: 'badge-draft', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedEvent: event, loading, fetchEvent, updateEvent, deleteEvent } = useEventsStore();
  const [generatingAgenda, setGeneratingAgenda] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => { if (id) fetchEvent(id); }, [id]);
  useEffect(() => { if (event) setEditStatus(event.status); }, [event]);

  const handleStatusChange = async (status: string) => {
    if (!event) return;
    setEditStatus(status);
    await updateEvent(event._id, { status });
  };

  const handleDelete = async () => {
    if (!event || !confirm(`Delete "${event.name}"?`)) return;
    await deleteEvent(event._id);
    navigate('/events');
  };

  const handleGenerateAgenda = async () => {
    if (!event) return;
    setGeneratingAgenda(true);
    try {
      const { data } = await aiAPI.generateAgenda(event._id, 8, event.category);
      await updateEvent(event._id, { agenda: data.agenda });
      await fetchEvent(event._id);
    } catch (err) { console.error(err); }
    setGeneratingAgenda(false);
  };

  if (loading || !event) return <div className="page"><div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: 'auto' }} /></div></div>;

  const budgetPct = event.budget?.total > 0 ? Math.round((event.budget.spent / event.budget.total) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>← Back</button>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: event.color || 'var(--gold)' }} />
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 500 }}>{event.name}</h1>
          <span className={`badge ${STATUS_CLASS[event.status] || 'badge-draft'}`}>{event.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-input" style={{ width: 'auto' }} value={editStatus} onChange={e => handleStatusChange(e.target.value)}>
            {['draft','planning','upcoming','confirmed','completed','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Overview */}
          <div className="card">
            <div className="card-title">Overview</div>
            {event.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>{event.description}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Date', value: format(new Date(event.date), 'MMMM d, yyyy') },
                { label: 'Time', value: event.time || 'TBD' },
                { label: 'Venue', value: `${event.venue?.name}${event.venue?.city ? `, ${event.venue.city}` : ''}` },
                { label: 'Category', value: event.category },
                { label: 'Expected Guests', value: event.expectedGuests.toLocaleString() },
                { label: 'Venue Capacity', value: event.venue?.capacity?.toLocaleString() || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Agenda</div>
              <button className="btn btn-gold btn-sm" onClick={handleGenerateAgenda} disabled={generatingAgenda}>
                {generatingAgenda ? <><span className="spinner spinner-sm" /> Generating…</> : '✦ AI Generate'}
              </button>
            </div>
            {event.agenda && event.agenda.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {event.agenda.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, minWidth: 48, flexShrink: 0 }}>{item.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                      {item.speaker && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Speaker: {item.speaker}</div>}
                    </div>
                    {item.duration && <div style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{item.duration}m</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: 13 }}>No agenda yet. Use AI to generate one.</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Budget */}
          <div className="card">
            <div className="card-title">Budget</div>
            <div style={{ fontSize: 26, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
              ${event.budget?.total?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              ${event.budget?.spent?.toLocaleString() || 0} spent
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetPct > 90 ? 'var(--red)' : 'var(--gold)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>{budgetPct}% used</div>
          </div>

          {/* Guests */}
          <div className="card">
            <div className="card-title">Guests ({event.guests?.length || 0})</div>
            {event.guests && event.guests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(event.guests as Array<{ _id: string; name: string; email: string; rsvp: string }>).slice(0, 6).map((g) => (
                  <div key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--gold)', flexShrink: 0 }}>
                      {g.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                    </div>
                    <span className={`badge ${g.rsvp === 'Confirmed' ? 'badge-confirmed' : 'badge-upcoming'}`} style={{ fontSize: 10 }}>{g.rsvp}</span>
                  </div>
                ))}
                {event.guests.length > 6 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>+{event.guests.length - 6} more</div>}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>No guests added yet</div>
            )}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="card">
              <div className="card-title">Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {event.tags.map(tag => <span key={tag} className="badge badge-draft">{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

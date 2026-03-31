import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store';
import { aiAPI } from '../api';
import { format } from 'date-fns';

const COLORS = ['#5b8def','#c9a84c','#9b6ee8','#4caf82','#e05252','#f08040'];
const STATUS_CLASS: Record<string, string> = {
  confirmed: 'badge-confirmed', planning: 'badge-planning',
  upcoming: 'badge-upcoming', draft: 'badge-draft', cancelled: 'badge-cancelled',
};
const CATEGORIES = ['Conference','Gala','Workshop','Product Launch','Networking','Corporate','Other'];
const STATUSES = ['draft','planning','upcoming','confirmed','completed','cancelled'];

const emptyForm = () => ({
  name: '', description: '', date: '', time: '09:00',
  venueName: '', venueCity: '', venueAddress: '', venueCapacity: '',
  category: 'Conference', status: 'planning', expectedGuests: '',
  budgetTotal: '', color: COLORS[0],
});

export default function Events() {
  const { events, loading, fetchEvents, createEvent, deleteEvent } = useEventsStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ status: '', category: '', search: '' });

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter(e => {
    if (filter.status && e.status !== filter.status) return false;
    if (filter.category && e.category !== filter.category) return false;
    if (filter.search && !e.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAIGenerate = async () => {
    if (!aiPrompt && !form.name) return;
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateEvent(aiPrompt || form.name);
      setForm(f => ({
        ...f,
        name: data.name || f.name,
        description: data.description || '',
        date: data.date || '',
        time: data.time || '09:00',
        venueName: data.venue?.name || '',
        venueCity: data.venue?.city || '',
        venueAddress: data.venue?.address || '',
        venueCapacity: String(data.venue?.capacity || ''),
        category: data.category || f.category,
        expectedGuests: String(data.expectedGuests || ''),
        budgetTotal: String(data.budget?.total || ''),
        color: data.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const handleCreate = async () => {
    if (!form.name || !form.date || !form.venueName) return alert('Name, date, and venue are required');
    setSaving(true);
    try {
      await createEvent({
        name: form.name, description: form.description, date: form.date, time: form.time,
        venue: { name: form.venueName, city: form.venueCity, address: form.venueAddress, capacity: +form.venueCapacity },
        category: form.category, status: form.status,
        expectedGuests: +form.expectedGuests || 0,
        budget: { total: +form.budgetTotal || 0, spent: 0, currency: 'USD' },
        color: form.color,
      });
      setShowModal(false);
      setForm(emptyForm());
      setAiPrompt('');
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-main">Events</div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>+ New Event</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input className="form-input" style={{ maxWidth: 240 }} placeholder="Search events…" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        <select className="form-input" style={{ maxWidth: 160 }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="form-input" style={{ maxWidth: 180 }} value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <div className="empty-title">No events found</div>
          <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Your First Event</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredEvents.map(event => (
            <div key={event._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '14px 18px' }} onClick={() => navigate(`/events/${event._id}`)}>
              <div style={{ width: 3, height: 52, borderRadius: 2, background: event.color || 'var(--gold)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{event.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>📅 {format(new Date(event.date), 'MMM d, yyyy')}</span>
                  <span>📍 {event.venue?.name}{event.venue?.city ? `, ${event.venue.city}` : ''}</span>
                  <span>🏷️ {event.category}</span>
                  {event.budget?.total > 0 && <span>💰 ${(event.budget.total / 1000).toFixed(0)}K</span>}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[event.status] || 'badge-draft'}`}>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>👥 {event.expectedGuests}</div>
              <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); if (confirm('Delete this event?')) deleteEvent(event._id); }} style={{ fontSize: 13 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Event</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* AI Generator */}
              <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>✦ Generate with AI</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Describe your event…" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-gold btn-sm" onClick={handleAIGenerate} disabled={generating}>
                    {generating ? <span className="spinner spinner-sm" /> : '✦ Generate'}
                  </button>
                </div>
              </div>

              <div className="form-group"><label className="form-label">Event Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Annual Tech Summit 2025" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Venue Name *</label><input className="form-input" value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="Grand Hyatt" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.venueCity} onChange={e => set('venueCity', e.target.value)} placeholder="New York" /></div>
                <div className="form-group"><label className="form-label">Capacity</label><input className="form-input" type="number" value={form.venueCapacity} onChange={e => set('venueCapacity', e.target.value)} placeholder="500" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Expected Guests</label><input className="form-input" type="number" value={form.expectedGuests} onChange={e => set('expectedGuests', e.target.value)} placeholder="150" /></div>
                <div className="form-group"><label className="form-label">Total Budget ($)</label><input className="form-input" type="number" value={form.budgetTotal} onChange={e => set('budgetTotal', e.target.value)} placeholder="50000" /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief event description…" rows={3} /></div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => set('color', c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid white' : '2px solid transparent', transition: 'border-color 0.2s' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Event'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

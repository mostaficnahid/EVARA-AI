import { useEffect, useState } from 'react';
import { useGuestsStore, useEventsStore } from '../store';

const ROLES = ['Attendee','Speaker','Panelist','VIP','Sponsor','Press','Facilitator','Executive','Other'];
const RSVPS = ['Pending','Confirmed','Declined','Waitlisted'];

export default function Guests() {
  const { guests, loading, fetchGuests, createGuest, updateGuest, deleteGuest } = useGuestsStore();
  const { events, fetchEvents } = useEventsStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', role: 'Attendee', rsvp: 'Pending', eventId: '' });

  useEffect(() => { fetchGuests(); fetchEvents(); }, []);

  const filtered = guests.filter(g => {
    if (rsvpFilter && g.rsvp !== rsvpFilter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.email) return alert('Name and email are required');
    setSaving(true);
    try {
      await createGuest({ ...form, events: form.eventId ? [form.eventId] : [] });
      setShowModal(false);
      setForm({ name: '', email: '', company: '', phone: '', role: 'Attendee', rsvp: 'Pending', eventId: '' });
    } catch { alert('Email may already exist'); }
    setSaving(false);
  };

  const rsvpColor: Record<string, string> = { Confirmed: 'badge-confirmed', Pending: 'badge-upcoming', Declined: 'badge-cancelled', Waitlisted: 'badge-draft' };

  const summaryStats = [
    { label: 'Total Guests', value: guests.length },
    { label: 'Confirmed', value: guests.filter(g => g.rsvp === 'Confirmed').length },
    { label: 'Pending', value: guests.filter(g => g.rsvp === 'Pending').length },
    { label: 'Declined', value: guests.filter(g => g.rsvp === 'Declined').length },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-main">Guest Directory</div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>+ Add Guest</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {summaryStats.map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input className="form-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" style={{ maxWidth: 160 }} value={rsvpFilter} onChange={e => setRsvpFilter(e.target.value)}>
          <option value="">All RSVPs</option>
          {RSVPS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <div className="empty-title">No guests yet</div>
          <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Add Guest</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(guest => (
            <div key={guest._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>
                {guest.name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{guest.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                  <span>{guest.email}</span>
                  {guest.company && <span>🏢 {guest.company}</span>}
                  <span>🎭 {guest.role}</span>
                </div>
              </div>
              <select
                className="form-input"
                style={{ width: 'auto', fontSize: 12, padding: '4px 8px', height: 30 }}
                value={guest.rsvp}
                onChange={e => updateGuest(guest._id, { rsvp: e.target.value })}
                onClick={e => e.stopPropagation()}
              >
                {RSVPS.map(r => <option key={r}>{r}</option>)}
              </select>
              <span className={`badge ${rsvpColor[guest.rsvp] || 'badge-draft'}`}>{guest.rsvp}</span>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => { if (confirm('Remove guest?')) deleteGuest(guest._id); }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Guest</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" /></div>
                <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555-0100" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Role</label><select className="form-input" value={form.role} onChange={e => set('role', e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
                <div className="form-group"><label className="form-label">RSVP</label><select className="form-input" value={form.rsvp} onChange={e => set('rsvp', e.target.value)}>{RSVPS.map(r => <option key={r}>{r}</option>)}</select></div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Event</label>
                <select className="form-input" value={form.eventId} onChange={e => set('eventId', e.target.value)}>
                  <option value="">— No event —</option>
                  {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleCreate} disabled={saving}>{saving ? 'Adding…' : 'Add Guest'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

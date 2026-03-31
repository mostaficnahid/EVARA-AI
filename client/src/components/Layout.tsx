import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import AIPanel from './AIPanel';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◈', exact: true },
  { to: '/events', label: 'Events', icon: '◉' },
  { to: '/calendar', label: 'Calendar', icon: '⊡' },
  { to: '/analytics', label: 'Analytics', icon: '⊘' },
  { to: '/guests', label: 'Guests', icon: '◎' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--gold)' }}>✦ Evara AI</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Events Organizer</div>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '12px 12px 4px' }}>Main</div>
          {NAV.slice(0, 3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: 13.5, marginBottom: 2,
                textDecoration: 'none', border: '1px solid transparent',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                borderColor: isActive ? 'rgba(201,168,76,0.2)' : 'transparent',
                transition: 'all 0.2s',
              })}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '12px 12px 4px' }}>Tools</div>
          {NAV.slice(3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: 13.5, marginBottom: 2,
                textDecoration: 'none', border: '1px solid transparent',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                borderColor: isActive ? 'rgba(201,168,76,0.2)' : 'transparent',
                transition: 'all 0.2s',
              })}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>✦ AI Assistant</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Claude claude-sonnet-4 • Active</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gold)', border: '1px solid var(--gold-border)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{user?.role}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout" style={{ fontSize: 14 }}>⎋</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 60, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>+ New Event</button>
          <button className="btn btn-gold btn-sm" onClick={() => setAiOpen(o => !o)}>
            {aiOpen ? '✦ Hide AI' : '✦ Ask AI'}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* AI Panel */}
      {aiOpen && <AIPanel onClose={() => setAiOpen(false)} />}
    </div>
  );
}

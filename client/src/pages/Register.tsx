import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function Register() {
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await register(form);
    } catch {
      setError('Registration failed. Email may already exist.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 420, padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', marginBottom: 6 }}>✦ Evara AI</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create your account</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" required /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required /></div>
          <div className="form-group"><label className="form-label">Organization</label><input className="form-input" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Acme Events Co." /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" required /></div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: 11, fontSize: 14 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

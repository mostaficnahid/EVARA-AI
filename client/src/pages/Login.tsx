import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function Login() {
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', marginBottom: 6 }}>✦ Evara AI</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to your account</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required /></div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '11px', fontSize: 14 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  );
}

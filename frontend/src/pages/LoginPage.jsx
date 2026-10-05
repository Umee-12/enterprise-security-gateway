import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Security Gateway</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}><span>or continue with</span></div>

        <div style={styles.oauthRow}>
          <button onClick={() => loginWithOAuth('google')} style={styles.oauthBtn}>
            <img src="https://www.google.com/favicon.ico" width="16" alt="Google" />
            Google
          </button>
          <button onClick={() => loginWithOAuth('github')} style={{ ...styles.oauthBtn, background: '#24292e' }}>
            <span>⚫</span> GitHub
          </button>
        </div>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        {/* Demo credentials */}
        <div style={styles.demo}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>🔑 Demo Credentials</p>
          <p>SuperAdmin: superadmin@securegateway.com / SuperAdmin@123</p>
          <p>Manager: manager@securegateway.com / Manager@123</p>
          <p>Employee: employee@securegateway.com / Employee@123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0' },
  subtitle: { color: '#94a3b8', marginTop: '8px' },
  error: {
    background: '#450a0a',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
  },
  btn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '4px',
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    color: '#475569',
    fontSize: '0.85rem',
    position: 'relative',
  },
  oauthRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  oauthBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#334155',
    border: '1px solid #475569',
    color: '#e2e8f0',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  footer: { textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },
  demo: {
    marginTop: '20px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '0.78rem',
    color: '#94a3b8',
    lineHeight: '1.8',
  },
};

export default LoginPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Security Gateway</h1>
          <p style={styles.subtitle}>Create a new account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="John Doe" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password (min 8 chars)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  card: {
    background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
    padding: '40px', width: '100%', maxWidth: '420px',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0' },
  subtitle: { color: '#94a3b8', marginTop: '8px' },
  error: {
    background: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5',
    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' },
  input: {
    background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
    padding: '10px 14px', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none',
  },
  btn: {
    background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px', fontSize: '1rem', fontWeight: 600, marginTop: '4px',
  },
  footer: { textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '20px' },
};

export default RegisterPage;

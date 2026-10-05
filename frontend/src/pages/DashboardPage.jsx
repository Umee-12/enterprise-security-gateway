import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const DashboardPage = () => {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const callAPI = async (method, url, data = null) => {
    setResult(null);
    setError('');
    try {
      const res = data
        ? await api[method](url, data)
        : await api[method](url);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    }
  };

  const cards = [
    {
      title: '👤 My Profile',
      description: 'GET /api/v1/employee/profile',
      action: () => callAPI('get', '/employee/profile'),
      color: '#10b981',
      roles: ['SuperAdmin', 'Manager', 'Employee'],
    },
    {
      title: '👥 All Employees',
      description: 'GET /api/v1/employee/all',
      action: () => callAPI('get', '/employee/all'),
      color: '#f59e0b',
      roles: ['Manager', 'SuperAdmin'],
    },
    {
      title: '💰 Approve Payroll',
      description: 'POST /api/v1/payroll/approve',
      action: () => callAPI('post', '/payroll/approve', { employeeId: 'emp001', amount: 5000, month: 'Oct 2026' }),
      color: '#6366f1',
      roles: ['Manager', 'SuperAdmin'],
    },
    {
      title: '📋 Payroll List',
      description: 'GET /api/v1/payroll/list',
      action: () => callAPI('get', '/payroll/list'),
      color: '#8b5cf6',
      roles: ['Manager', 'SuperAdmin'],
    },
    {
      title: '🔑 All Users',
      description: 'GET /api/v1/users',
      action: () => callAPI('get', '/users'),
      color: '#ef4444',
      roles: ['SuperAdmin'],
    },
    {
      title: '🔄 Refresh Token',
      description: 'POST /api/v1/auth/refresh',
      action: async () => {
        setResult(null); setError('');
        try {
          const res = await api.post('/auth/refresh');
          localStorage.setItem('accessToken', res.data.accessToken);
          setResult({ ...res.data, message: 'Token rotated successfully!' });
        } catch (err) {
          setError(err.response?.data?.message || 'Refresh failed.');
        }
      },
      color: '#0ea5e9',
      roles: ['SuperAdmin', 'Manager', 'Employee'],
    },
  ];

  const roleColors = { SuperAdmin: '#ef4444', Manager: '#f59e0b', Employee: '#10b981' };

  return (
    <div style={styles.page}>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div>
          <h2 style={styles.welcome}>Welcome back, {user?.name} 👋</h2>
          <p style={styles.sub}>Enterprise Multi-Tenant Security Gateway</p>
        </div>
        <span style={{ ...styles.rolePill, background: roleColors[user?.role] }}>
          {user?.role}
        </span>
      </div>

      {/* API Test Cards */}
      <h3 style={styles.sectionTitle}>API Endpoints</h3>
      <div style={styles.grid}>
        {cards.map((card) => {
          const hasAccess = card.roles.includes(user?.role);
          return (
            <div key={card.title} style={{ ...styles.card, opacity: hasAccess ? 1 : 0.5 }}>
              <div style={{ ...styles.cardTop, borderColor: card.color }}>
                <h4 style={{ color: card.color }}>{card.title}</h4>
                <code style={styles.code}>{card.description}</code>
                {!hasAccess && (
                  <span style={styles.noAccess}>🔒 Your role: {user?.role}</span>
                )}
              </div>
              <button
                onClick={card.action}
                disabled={!hasAccess}
                style={{ ...styles.cardBtn, background: hasAccess ? card.color : '#475569' }}
              >
                {hasAccess ? 'Test Endpoint' : 'Access Denied'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Result / Error */}
      {result && (
        <div style={styles.resultBox}>
          <h4 style={{ color: '#10b981', marginBottom: '8px' }}>✅ Response</h4>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ ...styles.resultBox, borderColor: '#ef4444' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '8px' }}>❌ Error</h4>
          <p style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  banner: {
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: { fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0' },
  sub: { color: '#94a3b8', marginTop: '4px' },
  rolePill: { padding: '6px 16px', borderRadius: '20px', fontWeight: 700, color: '#fff', fontSize: '0.9rem' },
  sectionTitle: { color: '#94a3b8', marginBottom: '16px', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTop: { borderLeft: '3px solid', paddingLeft: '12px' },
  code: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' },
  noAccess: { display: 'block', fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' },
  cardBtn: {
    border: 'none',
    color: '#fff',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  resultBox: {
    background: '#1e293b',
    border: '1px solid #10b981',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '16px',
  },
  pre: { color: '#a7f3d0', fontSize: '0.82rem', overflowX: 'auto', whiteSpace: 'pre-wrap' },
};

export default DashboardPage;

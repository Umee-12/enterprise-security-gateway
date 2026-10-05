import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleBadgeColor = {
  SuperAdmin: '#ef4444',
  Manager: '#f59e0b',
  Employee: '#10b981',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        🛡️ Security Gateway
      </Link>

      {user && (
        <div style={styles.right}>
          <span style={{ ...styles.badge, background: roleBadgeColor[user.role] || '#6366f1' }}>
            {user.role}
          </span>
          <span style={styles.name}>{user.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#e2e8f0',
    textDecoration: 'none',
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
  },
  name: { color: '#94a3b8', fontSize: '0.9rem' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};

export default Navbar;

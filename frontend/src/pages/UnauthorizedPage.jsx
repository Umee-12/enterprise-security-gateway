import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '16px' }}>
      <div style={{ fontSize: '4rem' }}>🚫</div>
      <h2 style={{ color: '#ef4444', fontSize: '1.8rem' }}>Access Denied</h2>
      <p style={{ color: '#94a3b8' }}>
        Your role (<strong style={{ color: '#f59e0b' }}>{user?.role}</strong>) does not have permission to access this resource.
      </p>
      <Link to="/dashboard" style={{ background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
        Go to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;

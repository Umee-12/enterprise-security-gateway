import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store access token
      localStorage.setItem('accessToken', token);

      // Fetch full user profile
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          navigate('/dashboard');
        })
        .catch(() => {
          // Fallback from URL params
          setUser({ name: decodeURIComponent(name || ''), role });
          navigate('/dashboard');
        });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#6366f1', fontSize: '1.1rem' }}>⏳ Completing sign in...</p>
    </div>
  );
};

export default OAuthCallbackPage;

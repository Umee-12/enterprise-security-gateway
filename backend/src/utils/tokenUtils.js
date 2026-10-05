const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// ─── Generate Access Token (15 min) ──────────────────────────────────────────
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

// ─── Generate Refresh Token (7 days) ─────────────────────────────────────────
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Hash a token for safe DB storage ────────────────────────────────────────
const hashToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(token, salt);
};

// ─── Compare token with stored hash ──────────────────────────────────────────
const compareToken = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

// ─── Set Refresh Token Cookie ─────────────────────────────────────────────────
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,          // Not accessible via JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'Strict',      // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/v1/auth',    // Only sent to auth routes
  });
};

// ─── Clear Refresh Token Cookie ──────────────────────────────────────────────
const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(0),
    path: '/api/v1/auth',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  compareToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};

const rateLimit = require('express-rate-limit');

// ─── Login Rate Limiter ───────────────────────────────────────────────────────
// Max 5 failed attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // RateLimit-* headers
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
});

// ─── Register Rate Limiter ────────────────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many registration attempts from this IP. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── General API Limiter ──────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, apiLimiter };

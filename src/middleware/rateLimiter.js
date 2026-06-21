const rateLimit = require('express-rate-limit');

// ─── General API Rate Limiter ────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ─── Auth Rate Limiter (stricter) ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Only 10 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// ─── Upload Rate Limiter ─────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                   // 20 file uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. Please try again after 1 hour.',
  },
});

// ─── Location Update Limiter (for volunteer tracking) ────────────────────────
const locationLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,              // 30 location updates per minute (every 2 seconds)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Location update rate limit exceeded.',
  },
});

module.exports = { generalLimiter, authLimiter, uploadLimiter, locationLimiter };

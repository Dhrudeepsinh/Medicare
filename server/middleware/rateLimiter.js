const rateLimit = require('express-rate-limit');

/**
 * General rate limiter: 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true',
});

/**
 * Auth rate limiter: 10 requests per 15 minutes (stricter for login/register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true',
});

module.exports = { generalLimiter, authLimiter };

import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Rate limiter configuration options
 * @type {Object}
 * @property {number} points - Maximum number of points (requests) that can be consumed
 * @property {number} duration - Time window in seconds for rate limiting
 * @property {number} blockDuration - Duration in seconds to block after all points are consumed
 */
const rateLimiterOptions = {
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60,
};

const rateLimiter = new RateLimiterMemory(rateLimiterOptions);

/**
 * Rate limiter middleware for API endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} - Either passes to next middleware or returns error response
 */
const rateLimiterMiddleware = (req, res, next) => {
  const key = req.ip;
  
  rateLimiter.consume(key, 1)
    .then(() => next())
    .catch((rejRes) => {
      const secs = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Too many login attempts. Please try again later.',
        retryAfter: secs
      });
    });
};

export default rateLimiterMiddleware;

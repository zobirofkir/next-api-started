import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Rate limiter configuration options
 * @type {Object}
 * @property {number} points - Maximum number of points (requests) that can be consumed
 * @property {number} duration - Time window in seconds for rate limiting
 * @property {number} blockDuration - Duration in seconds to block after all points are consumed
 */
const rateLimiterOptions = {
  points: parseInt(process.env.RATE_LIMITER_POINTS, 10) || 5,
  duration: parseInt(process.env.RATE_LIMITER_DURATION, 10) || 900,
  blockDuration: parseInt(process.env.RATE_LIMITER_BLOCK_DURATION, 10) || 900,
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
    .then((rateLimiterRes) => {
      // Add rate limit headers to successful responses
      res.setHeader('X-RateLimit-Limit', rateLimiterOptions.points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      next();
    })
    .catch((rejRes) => {
      const secs = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
      
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Too many login attempts. Please try again later.',
        retryAfter: secs,
        remainingPoints: 0,
        maxPoints: rateLimiterOptions.points,
        msBeforeNext: rejRes.msBeforeNext
      });
    });
};

export default rateLimiterMiddleware;

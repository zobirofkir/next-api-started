import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiting configuration
const rateLimiterOptions = {
  // 5 failed login attempts per IP per 15 minutes
  points: 5,
  duration: 15 * 60, // 15 minutes in seconds
  blockDuration: 15 * 60, // Block for 15 minutes after all points are consumed
};

const rateLimiter = new RateLimiterMemory(rateLimiterOptions);

const rateLimiterMiddleware = (req, res, next) => {
  // Use IP address as the key for rate limiting
  const key = req.ip;
  
  rateLimiter.consume(key, 1) // consume 1 point per request
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      // Calculate remaining time in seconds
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

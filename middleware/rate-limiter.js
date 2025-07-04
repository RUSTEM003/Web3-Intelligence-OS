const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/rate-limiter.log' })
  ]
});

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later',
        retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes'
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many API requests',
    retryAfter: '15 minutes'
  }
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true
});

const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many upload requests',
    retryAfter: '1 hour'
  }
});

const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many search requests',
    retryAfter: '1 minute'
  }
});

const aiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many AI processing requests',
    retryAfter: '1 hour'
  }
});

const videoLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many video processing requests',
    retryAfter: '1 hour'
  }
});

const strictLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    error: 'Rate limit exceeded for sensitive endpoint',
    retryAfter: '1 minute'
  }
});

const premiumLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    error: 'Premium rate limit exceeded',
    retryAfter: '15 minutes'
  }
});

const ipWhitelist = new Set([
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16'
]);

const createCustomLimiter = (windowMs, max, message) => {
  return createRateLimiter({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
    }
  });
};

const skipWhitelistedIPs = (req) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  return ipWhitelist.has(clientIP);
};

const dynamicLimiter = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
  
  if (isBot) {
    return createRateLimiter({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: {
        error: 'Bot rate limit exceeded',
        retryAfter: '1 hour'
      }
    })(req, res, next);
  }
  
  return apiLimiter(req, res, next);
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  aiLimiter,
  videoLimiter,
  strictLimiter,
  premiumLimiter,
  createCustomLimiter,
  dynamicLimiter,
  skipWhitelistedIPs,
  redis
};

const rateLimit = require('express-rate-limit');
const { getAllConfig } = require('../helpers/config');
const { apiError } = require('../api/apiError');
const logger = require('../logging/logger');

/**
 * Create a rate limiter middleware.
 * @param {Object} options - Options for rate limiting.
 * @param {number} [options.windowMs] - Time window in milliseconds.
 * @param {number} [options.max] - Maximum requests per window.
 * @param {string} [options.message] - Message to return when limit is exceeded.
 * @param {function} [options.keyGenerator] - Custom function to generate keys (IP, user ID, etc.).
 * @param {boolean} [options.logLimitReached] - Whether to log when the limit is reached.
 * @returns {function} - Middleware function for rate limiting.
 */
const createRateLimiter = (options = {}) => {
    const config = getAllConfig();

    const limiter = rateLimit({
        windowMs: options.windowMs || config.rateLimit.windowMs || 15 * 60 * 1000, // Default to 15 minutes
        max: options.max || config.rateLimit.max || 100, // Default to 100 requests per window
        message: options.message || 'Too many requests, please try again later.',
        keyGenerator: options.keyGenerator || ((req) => req.ip), // Default key is the request IP
        handler: (req, res, next) => {
            const errorMsg = options.message || 'Too many requests, please try again later.';
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            throw new apiError(429, errorMsg);
        },
        onLimitReached: (req, res, options) => {
            if (options.logLimitReached) {
                logger.warn(`Rate limit reached for key: ${options.keyGenerator(req)}`);
            }
        },
    });

    return limiter;
};

/**
 * Create a dynamic rate limiter based on user roles.
 * @param {Object} roleLimits - Role-based rate limits configuration.
 * @param {string} [defaultMessage] - Default message to return when the limit is exceeded.
 * @returns {function} - Middleware function for dynamic role-based rate limiting.
 */
const createRoleBasedRateLimiter = (roleLimits, defaultMessage = 'Too many requests, please try again later.') => {
    return (req, res, next) => {
        const userRole = req.user?.role || 'guest'; // Fallback to 'guest' if user role is not found
        const userLimit = roleLimits[userRole] || roleLimits['guest']; // Get the rate limit for the role or guest

        if (!userLimit) {
            return next(); // If no limit is defined for the role, skip rate limiting
        }

        const limiter = createRateLimiter({
            windowMs: userLimit.windowMs,
            max: userLimit.max,
            message: userLimit.message || defaultMessage,
            keyGenerator: (req) => req.user?.id || req.ip, // Use user ID if available, fallback to IP
            logLimitReached: true, // Log when limit is reached
        });

        return limiter(req, res, next);
    };
};

/**
 * Function to reset the rate limit for a specific key (IP or user ID).
 * @param {string} key - The unique key (usually IP or user ID).
 * @param {string} limiterName - The name of the rate limiter for logging.
 * @returns {Promise} - Returns a promise when rate limit is reset.
 */
const resetRateLimit = (key, limiterName) => {
    return new Promise((resolve, reject) => {
        rateLimit.resetKey(key);
        logger.info(`Rate limit reset for key: ${key} in limiter: ${limiterName}`);
        resolve();
    });
};

/**
 * Generic rate limiter generator.
 * @param {Object} options - Options for generating the rate limiter.
 * @param {number} [options.windowMs] - Time window in milliseconds.
 * @param {number} [options.max] - Maximum requests per window.
 * @param {string} [options.message] - Message to return when limit is exceeded.
 * @param {string} [options.type] - Type of rate limiter (e.g., 'ip', 'user', 'apiKey').
 * @param {function} [options.keyGenerator] - Function to generate a key (IP, user ID, API key, etc.).
 * @returns {function} - Middleware function for rate limiting.
 */
const generateRateLimiter = (options = {}) => {
    const config = getAllConfig();

    // Select the type of rate limiting
    const defaultKeyGenerator = {
        ip: (req) => req.ip,
        user: (req) => req.user?.id || req.ip,
        apiKey: (req) => req.headers['x-api-key'] || req.ip,
    };

    const keyGen = options.keyGenerator || defaultKeyGenerator[options.type || 'ip'];

    const limiter = rateLimit({
        windowMs: options.windowMs || config.rateLimit.windowMs || 15 * 60 * 1000, // Default to 15 minutes
        max: options.max || config.rateLimit.max || 100, // Default to 100 requests
        message: options.message || 'Too many requests, please try again later.',
        keyGenerator: keyGen,
        handler: (req, res) => {
            const errorMsg = options.message || 'Too many requests, please try again later.';
            logger.warn(`Rate limit exceeded for key: ${keyGen(req)}`);
            throw new apiError(429, errorMsg);
        },
        onLimitReached: (req, res, options) => {
            if (options.logLimitReached) {
                logger.warn(`Rate limit reached for key: ${keyGen(req)}`);
            }
        },
    });

    return limiter;
};

module.exports = {
    createRateLimiter,
    createRoleBasedRateLimiter,
    resetRateLimit,
    generateRateLimiter,
};


// Usage Examples:
// IP-Based Rate Limiting:
// javascript
// Copy code
// const ipLimiter = generateRateLimiter({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 50, // 50 requests per 10 minutes
//     type: 'ip',
//     message: 'Too many requests from this IP, please try again later.',
// });
// app.use(ipLimiter);
// User-Based Rate Limiting:
// javascript
// Copy code
// const userLimiter = generateRateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // 100 requests per 15 minutes
//     type: 'user',
//     message: 'Too many requests from this user, please try again later.',
// });
// app.use(userLimiter);
// API Key-Based Rate Limiting:
// javascript
// Copy code
// const apiKeyLimiter = generateRateLimiter({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 500, // 500 requests per hour per API key
//     type: 'apiKey',
//     message: 'Too many requests from this API key, please try again later.',
// });
// app.use(apiKeyLimiter);
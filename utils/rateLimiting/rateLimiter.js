const rateLimit = require('express-rate-limit');
const { getAllConfig } = require('../helpers/config');
const { apiError } = require('../api/apiError');

/**
 * Create a rate limiter middleware.
 * @param {Object} options - Options for rate limiting.
 * @param {number} [options.windowMs] - Time window in milliseconds.
 * @param {number} [options.max] - Maximum requests per window.
 * @param {string} [options.message] - Message to return when limit is exceeded.
 * @returns {function} - Middleware function for rate limiting.
 */
const createRateLimiter = (options = {}) => {
    const config = getAllConfig();

    const limiter = rateLimit({
        windowMs: options.windowMs || config.rateLimit.windowMs || 15 * 60 * 1000, // Default to 15 minutes
        max: options.max || config.rateLimit.max || 100, // Default to 100 requests
        message: options.message || 'Too many requests, please try again later.',
        handler: (req, res) => {
            throw new apiError(429, limiter.options.message);
        },
        keyGenerator: (req) => {
            return req.ip; // You can customize this to use user ID or other identifiers
        },
        onLimitReached: (req, res, options) => {
            console.warn(`Rate limit exceeded for IP: ${req.ip}`);
        },
    });

    return limiter;
};

module.exports = {
    createRateLimiter,
};

// usage 

// const generalLimiter = createRateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests
//     message: 'Too many requests from your IP, please try again later.',
// });
// app.use(generalLimiter);

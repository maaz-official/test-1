// AuthMiddleware.js
// This middleware verifies the JWT token and ensures that the user is authenticated.

const jwt = require('jsonwebtoken');
const { ApiError, HttpStatus } = require('../utils/api/apiError');
const { User } = require('../models');
const { getConfig } = require('../utils/helpers/config');
const redis = require('../utils/cache/redisClient');

// Middleware to require authentication with JWT
const requireAuth = async (req, res, next) => {
    const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];  // Support Authorization header as well
    if (!token) {
        return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Authorization token is required'));
    }

    try {
        // Rate limiting for authentication requests
        await rateLimiter.check(req.ip);

        // Verify the JWT token
        const decoded = jwt.verify(token, getConfig('JWT_SECRET'));

        // Check if the token is blacklisted (e.g., during logout, password reset)
        const isRevoked = await redis.exists(`blacklist:${token}`);
        if (isRevoked) {
            return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Token has been revoked'));
        }

        // Check if user exists and is active
        const user = await User.findById(decoded.userId).select('role email username status phone_number');
        if (!user) {
            return next(new ApiError(HttpStatus.UNAUTHORIZED, 'User not found'));
        }
        const statusMessage = user.getStatusMessage();

        if (user.status !== 'active') {
            return next(new ApiError(HttpStatus.UNAUTHORIZED, statusMessage));
        }
        // Attach the user details to the request object
        req.user = {
            id: user._id,
            role: user.role,
            email: user.email,
            username: user.username,
        };

        logger.info(`User ${user.username} authenticated successfully`);

        next();
    } catch (error) {
        // Log the error details for better debugging
        logger.error(`Authentication error: ${error.message}`, { token, ip: req.ip });

        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Token expired, please login again'));
        }
        return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid or expired token'));
    }
};

// Middleware to require specific roles (Role-Based Access Control)
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(HttpStatus.FORBIDDEN, 'You do not have permission to access this resource'));
        }
        next();
    };
};

// Security measure: Ensure no unauthorized user details are injected
// Only allows the authenticated user and role information provided by the verified JWT token
const secureAttachUserDetails = (req, res, next) => {
    if (req.body && req.body.user) {
        return next(new ApiError(HttpStatus.FORBIDDEN, 'You cannot attach user details in the request body'));
    }
    next(); // Proceed if no external user details are attached
};

module.exports = {
    requireAuth,
    requireRole,
    secureAttachUserDetails
};

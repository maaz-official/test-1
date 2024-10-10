const jwt = require('jsonwebtoken');
const ApiError = require('../api/apiError');
const HttpStatus = require('../api/httpStatus');
const logger = require('../utils/logger'); // Assuming you have a logger utility

/**
 * Validates the presence of necessary environment variables.
 * @throws {ApiError} - Throws an error if required environment variables are not set.
 */
const validateEnvVariables = () => {
    if (!process.env.JWT_SECRET) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'JWT secret is not defined.');
    }
};

/**
 * Generates a JSON Web Token for the user with customizable expiration and logging.
 * @param {Object} user - User object containing user information.
 * @param {string} type - Type of token: 'access' or 'refresh'.
 * @param {string} [expiresIn] - Custom expiration time (e.g., '1h', '30d'). Defaults to '1h' for access tokens and '30d' for refresh tokens.
 * @param {string} [algorithm='HS256'] - Algorithm used for signing the token.
 * @returns {Promise<string>} - Generated token.
 * @throws {ApiError} - Throws an error if JWT secret is not set.
 */
const generateToken = async (user, type, expiresIn, algorithm = 'HS256') => {
    validateEnvVariables();

    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        // Optionally add a nonce for more security
        nonce: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };

    const expiration = type === 'refresh' ? '30d' : expiresIn || '1h';

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiration, algorithm });
    logger.info(`Generated ${type} token for user: ${user.email}`);

    return token;
};

/**
 * Verifies the provided token and validates claims.
 * @param {string} token - JWT to verify.
 * @returns {Promise<Object>} - Decoded token payload.
 * @throws {ApiError} - Throws an error if token verification fails.
 */
const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Optionally validate claims
        if (!decoded.id || !decoded.role) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token is missing required claims.');
        }
        return decoded;
    } catch (error) {
        let message = 'Invalid token.';
        const status = HttpStatus.UNAUTHORIZED;

        // Differentiate error types for better handling
        if (error.name === 'TokenExpiredError') {
            message = 'Token has expired.';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Malformed token.';
        } else if (error.name === 'NotBeforeError') {
            message = 'Token is not active.';
        }

        logger.error(`Token verification failed: ${message}`);
        throw new ApiError(status, message);
    }
};

/**
 * Optional: Blacklist a token to manage logouts or revocations.
 * @param {string} token - The JWT to blacklist.
 * @param {number} [expiresIn=3600] - Expiration time for the blacklisted token (in seconds).
 */
const blacklistToken = async (token, expiresIn = 3600) => {
    // Implementation of token blacklisting (e.g., store in a Redis cache or database)
    // Example: await redisClient.set(token, 'blacklisted', 'EX', expiresIn);
    logger.info(`Blacklisted token: ${token}`);
};

/**
 * Utility function to extract token from request headers.
 * @param {Object} req - Express request object.
 * @returns {string|null} - JWT or null if not found.
 */
const extractTokenFromHeaders = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Return the token
    }
    return null; // No token found
};

module.exports = { generateToken, verifyToken, blacklistToken, extractTokenFromHeaders };

// Call validateEnvVariables once during app initialization
validateEnvVariables();

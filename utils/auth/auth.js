const jwt = require('jsonwebtoken');
const ApiError = require('../api/apiError');
const HttpStatus = require('../api/httpStatus');

/**
 * Generates a JSON Web Token for the user.
 * @param {Object} user - User object containing user information.
 * @returns {string} - Generated token.
 */
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

/**
 * Verifies the provided token.
 * @param {string} token - JWT to verify.
 * @returns {Object} - Decoded token payload.
 * @throws {ApiError} - Throws an error if token verification fails.
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token.');
    }
};

module.exports = { generateToken, verifyToken };

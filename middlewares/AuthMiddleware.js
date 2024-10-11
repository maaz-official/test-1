
// AuthMiddleware.js
// This middleware verifies the JWT token and ensures that the user is authenticated.

const jwt = require('jsonwebtoken');
const { apiError, HttpStatus } = require('../utils/api/apiError');
const models = require('../models'); // Assuming User is in models/index.js

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return next(new apiError(HttpStatus.UNAUTHORIZED, 'Authorization token is required'));
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const user = await models.User.findById(decoded.id);
        if (!user) {
            return next(new apiError(HttpStatus.UNAUTHORIZED, 'Invalid token, user not found'));
        }
        req.user = user; // Attach user to request
        next();
    } catch (error) {
        next(new apiError(HttpStatus.UNAUTHORIZED, 'Invalid or expired token'));
    }
};

module.exports = authMiddleware;


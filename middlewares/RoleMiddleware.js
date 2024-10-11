
// RoleMiddleware.js
// This middleware ensures the user has the correct role to access specific routes (e.g., admin or host).

const { ApiError, HttpStatus } = require('../api/apiError');

const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return next(new ApiError(HttpStatus.FORBIDDEN, 'Access denied'));
        }
        next();
    };
};

module.exports = roleMiddleware;


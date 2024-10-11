
// ErrorMiddleware.js
// This middleware catches errors thrown by the application and formats the response.

const { ApiError, HttpStatus } = require('../api/apiError');

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            details: err.details || null,
        });
    } else {
        console.error(err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        });
    }
};

module.exports = errorMiddleware;


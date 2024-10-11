
// GeoLocationMiddleware.js
// Middleware to handle geolocation processing and validation.

const { ApiError, HttpStatus } = require('../api/apiError');

const geoLocationMiddleware = (req, res, next) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return next(new ApiError(HttpStatus.BAD_REQUEST, 'Latitude and longitude are required'));
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return next(new ApiError(HttpStatus.BAD_REQUEST, 'Invalid latitude or longitude values'));
    }

    next();
};

module.exports = geoLocationMiddleware;



// LoggingMiddleware.js
// This middleware logs each incoming request for auditing and debugging purposes.

const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
    logger.info(Incoming request:  , { body: req.body, params: req.params, query: req.query });
    next();
};

module.exports = loggingMiddleware;


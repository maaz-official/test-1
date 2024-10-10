const winston = require('winston');

/**
 * Configures the Winston logger for structured logging.
 */
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

/**
 * Logs information at 'info' level.
 * @param {string} message - Message to log.
 */
const logInfo = (message) => {
    logger.info(message);
};

/**
 * Logs error messages at 'error' level.
 * @param {string} message - Message to log.
 */
const logError = (message) => {
    logger.error(message);
};

module.exports = { logInfo, logError };

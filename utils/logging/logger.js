const winston = require('winston');
const { format } = require('winston');
const path = require('path');
const { createLogger, transports, combine, timestamp, json } = winston;

// Define log file paths for better organization
const logDirectory = path.join(__dirname, 'logs');

/**
 * Configures the Winston logger for structured logging.
 * This logger can log to both the console and files, with different levels and formats.
 */
const logger = createLogger({
    level: 'info', // Set default logging level
    format: combine(
        timestamp(), // Add timestamp to each log entry
        json() // Use JSON format for structured logging
    ),
    transports: [
        // Log to console with color formatting
        new transports.Console({
            format: format.combine(
                format.colorize(), // Add color to console logs
                format.simple() // Use a simple format for console output
            )
        }),
        // Log to a file for all messages
        new transports.File({
            filename: path.join(logDirectory, 'combined.log'), // Log all levels to combined.log
            level: 'info', // Include all info level messages and higher
        }),
        // Log to a separate file for error messages
        new transports.File({
            filename: path.join(logDirectory, 'error.log'), // Log error level messages to error.log
            level: 'error', // Only log error messages
        }),
    ],
});

/**
 * Logs a message at the specified level.
 * This function can be used throughout the application for logging various messages.
 * @param {string} level - The logging level (e.g., 'info', 'error', 'warn').
 * @param {string} message - The message to log.
 * @param {Object} [meta={}] - Optional metadata to include in the log entry.
 */
const log = (level, message, meta = {}) => {
    if (typeof message !== 'string' || !message.trim()) {
        console.warn('Invalid log message.'); // Warn if message is not valid
        return;
    }

    logger.log(level, message, meta); 
};

module.exports = { log };
// // Logging an informational message
// log('info', 'Application has started successfully.');

// // Logging an error message with metadata
// log('error', 'An error occurred while processing the request.', { userId: 123, errorCode: 'USER_NOT_FOUND' });

// // Logging a warning message
// log('warn', 'This is a warning message.');

// // Attempting to log an invalid message
// log('info', ''); // This will trigger a warning about invalid log message
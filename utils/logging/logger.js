const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log file paths for better organization
const logDirectory = path.join(__dirname, 'logs');

// Ensure log directory exists or create it
const fs = require('fs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Custom format for console output in development
const consoleFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    const separator = '\n----------------------------------------\n';
    return stack
        ? `${separator}${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}${separator}`
        : `${separator}${timestamp} [${level.toUpperCase()}]: ${message}${separator}`;
});

// Create a Winston logger with different configurations based on environment
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
        winston.format.errors({ stack: true }), // Include stack trace for errors
        winston.format.json() // Default JSON format for file logs
    ),
    transports: [
        // Console transport for human-readable logs in development
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
            format: process.env.NODE_ENV === 'production'
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json() // JSON format for production console
                )
                : winston.format.combine(
                    winston.format.colorize(), // Add color for better readability in console
                    consoleFormat // Human-readable format for development console
                )
        }),

        // Daily rotation for all logs in JSON format for file storage
        new DailyRotateFile({
            filename: path.join(logDirectory, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d', // Keep logs for 14 days
            level: 'info', // Log all levels from info and above
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json() // JSON format for file storage
            )
        }),

        // Separate error logs in JSON format for file storage
        new DailyRotateFile({
            filename: path.join(logDirectory, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d', // Keep error logs for 30 days
            level: 'error', // Only log error messages
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json() // JSON format for file storage
            )
        })
    ],

    // Handle uncaught exceptions globally
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDirectory, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d', // Keep exception logs for 30 days
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json() // JSON for file logs
            )
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                consoleFormat // Human-readable format for console in development
            )
        })
    ],

    // Handle unhandled promise rejections globally
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDirectory, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d', // Keep rejection logs for 30 days
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json() // JSON for file logs
            )
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                consoleFormat // Human-readable format for console in development
            )
        })
    ]
});

// Export the logger
module.exports = logger;

// Usage in your code:
// const logger = require('./utils/logger');
// logger.info('This is an informational message');
// logger.error('This is an error message', { errorCode: 'ERROR_001', userId: '12345' });

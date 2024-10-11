const { HttpStatus, apiError } = require('../api/apiError');

require('dotenv').config();



/**
 * Retrieves the application configuration.
 * @param {string} key - Configuration key.
 * @param {string} [defaultValue] - Default value to return if the key is missing.
 * @returns {string} - Configuration value.
 * @throws {ApiError} - Throws an error if the configuration key is missing.
 */
const getConfig = (key, defaultValue) => {
    const value = process.env[key];

    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;  // Return default value if provided
        }
        throw new apiError(HttpStatus.INTERNAL_SERVER_ERROR, `Missing configuration for key: ${key}`);
    }

    return value;
};

/**
 * Retrieves the configuration as a structured object.
 * @returns {Object} - Object containing application configuration.
 */
const getAllConfig = () => {
    return {
        port: getConfig('PORT', 3000), 
        db: {
            host: getConfig('DB_HOST', 'localhost'),
            port: getConfig('DB_PORT', 27017),
            name: getConfig('DB_NAME', 'my_database'),
            user: getConfig('DB_USER', ''),
            password: getConfig('DB_PASSWORD', ''),
        },
        jwt: {
            secret: getConfig('JWT_SECRET'),
            expiration: getConfig('JWT_EXPIRATION', '1h'), 
        },
        upload: {
            directory: getConfig('UPLOAD_DIR', 'uploads'),
            maxFileSize: getConfig('MAX_FILE_SIZE', 2097152), 
            allowedFileTypes: getConfig('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,application/pdf').split(','),
        },
        logLevel: getConfig('LOG_LEVEL', 'info'), 
        smtp: {
            host: getConfig('SMTP_HOST'),
            port: getConfig('SMTP_PORT'),
            user: getConfig('SMTP_USER'),
            pass: getConfig('SMTP_PASS'),
            from: getConfig('SMTP_FROM'),
        },
    };
};

module.exports = {
    getConfig,
    getAllConfig,
    // ConfigError,
};

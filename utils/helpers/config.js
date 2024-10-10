require('dotenv').config();

/**
 * Retrieves the application configuration.
 * @param {string} key - Configuration key.
 * @returns {string} - Configuration value.
 */
const getConfig = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing configuration for key: ${key}`);
    }
    return value;
};

module.exports = { getConfig };

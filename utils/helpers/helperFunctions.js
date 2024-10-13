const { User } = require("../../models");
const crypto = require('crypto');
const { getConfig } = require("./config");
const jwt = require('jsonwebtoken');

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - String to capitalize.
 * @returns {string} - Capitalized string or empty string for invalid input.
 */
const capitalizeFirstLetter = (str) => {
    if (typeof str !== 'string' || str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case.
 * Title case means capitalizing the first letter of each word.
 * @param {string} str - String to convert.
 * @param {string} [delimiter=' '] - Optional delimiter to split words (default is space).
 * @returns {string} - Title-cased string or empty string for invalid input.
 */
const toTitleCase = (str, delimiter = ' ') => {
    if (typeof str !== 'string' || str.length === 0) return '';
    return str
        .split(delimiter)
        .map(word => {
            // Convert each word to title case, skipping empty strings
            return word.length > 0 ? capitalizeFirstLetter(word) : '';
        })
        .join(delimiter);
};

/**
 * Capitalizes the first letter of each word in a string and supports custom delimiters.
 * This method can handle multiple spaces and trims the result.
 * @param {string} str - String to convert.
 * @param {string} [delimiter=' '] - Optional delimiter to split words (default is space).
 * @returns {string} - Title-cased string or empty string for invalid input.
 */
const toTitleCaseAdvanced = (str, delimiter = ' ') => {
    if (typeof str !== 'string' || str.length === 0) return '';
    return str
        .trim()
        .split(delimiter)
        .filter(Boolean) // Remove empty strings from the array
        .map(word => capitalizeFirstLetter(word))
        .join(delimiter);
};

const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return {};

    return cookieHeader.split(';').reduce((cookies, cookieStr) => {
        const [name, ...rest] = cookieStr.split('=');
        const trimmedName = name?.trim(); // Trim whitespace around the cookie name

        if (!trimmedName) return cookies; // Skip malformed cookies with no name

        const value = rest.join('=').trim(); // Rejoin and trim any potential '=' in the value
        try {
            cookies[trimmedName] = decodeURIComponent(value); // Decode URL-encoded values
        } catch (e) {
            // Handle decoding errors gracefully and skip the cookie if necessary
            console.warn(`Failed to decode cookie value: ${value}`, e);
        }
        return cookies;
    }, {});
};

const generateUsername = async (first_name, last_name, maxAttempts = 5) => {
    try {
        // Sanitize and generate the base username
        const baseUsername = `${first_name.trim().toLowerCase()}_${last_name.trim().toLowerCase()}`.replace(/\s+/g, '');
        let username = baseUsername;

        let attempts = 0;
        let isUnique = false;

        while (!isUnique && attempts < maxAttempts) {
            // Check if the username already exists
            const existingUser = await User.findOne({ username });

            if (!existingUser) {
                isUnique = true; // Username is unique, break the loop
            } else {
                // Generate a new username with a random numeric suffix
                const randomSuffix = crypto.randomInt(1000, 9999); // Generate a 4-digit random number
                username = `${baseUsername}_${randomSuffix}`;
            }

            attempts += 1;
        }

        if (!isUnique) {
            throw new Error(`Failed to generate a unique username after ${maxAttempts} attempts.`);
        }

        logger.info(`Generated unique username: ${username}`);
        return username;

    } catch (error) {
        logger.error(`Error generating username: ${error.message}`);
        throw error;
    }
};
const generateAuthToken = (userId) => {
    return jwt.sign({ userId}, getConfig('JWT_SECRET'), {
        expiresIn: getConfig('SESSION_EXPIRATION', 3600), // 1 hour session
    });
};

module.exports = { capitalizeFirstLetter, toTitleCase, toTitleCaseAdvanced, parseCookies, generateUsername, generateAuthToken};

// console.log(capitalizeFirstLetter('hello world')); // Output: Hello world
// console.log(toTitleCase('hello world')); // Output: Hello World
// console.log(toTitleCase('hello   world', ' ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('  hello   world  ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('hello-world', '-')); // Output: Hello-World
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
module.exports = { capitalizeFirstLetter, toTitleCase, toTitleCaseAdvanced, parseCookies};

// console.log(capitalizeFirstLetter('hello world')); // Output: Hello world
// console.log(toTitleCase('hello world')); // Output: Hello World
// console.log(toTitleCase('hello   world', ' ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('  hello   world  ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('hello-world', '-')); // Output: Hello-World
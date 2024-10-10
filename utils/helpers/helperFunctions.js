/**
 * Capitalizes the first letter of a string.
 * @param {string} str - String to capitalize.
 * @returns {string} - Capitalized string.
 */
const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case.
 * @param {string} str - String to convert.
 * @returns {string} - Title-cased string.
 */
const toTitleCase = (str) => {
    return str
        .split(' ')
        .map(word => capitalizeFirstLetter(word))
        .join(' ');
};

module.exports = { capitalizeFirstLetter, toTitleCase };

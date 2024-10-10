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

module.exports = { capitalizeFirstLetter, toTitleCase, toTitleCaseAdvanced };

// console.log(capitalizeFirstLetter('hello world')); // Output: Hello world
// console.log(toTitleCase('hello world')); // Output: Hello World
// console.log(toTitleCase('hello   world', ' ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('  hello   world  ')); // Output: Hello World
// console.log(toTitleCaseAdvanced('hello-world', '-')); // Output: Hello-World
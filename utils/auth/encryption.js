const crypto = require('crypto');
const ApiError = require('../api/apiError');

/**
 * Encrypts the given text using the specified algorithm and key.
 * @param {string} text - Text to encrypt.
 * @param {string} [algorithm='aes-256-ctr'] - The encryption algorithm to use.
 * @param {string} [customSalt='defaultSalt'] - Custom salt for key derivation.
 * @returns {string} - Encrypted text with IV.
 * @throws {ApiError} - Throws an error if encryption fails.
 */
const encrypt = (text, algorithm = 'aes-256-ctr', customSalt = 'defaultSalt') => {
    if (typeof text !== 'string' || text.length === 0) {
        throw new ApiError(400, 'Invalid input: text must be a non-empty string.');
    }

    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, customSalt, 32);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        throw new ApiError(500, `Encryption failed: ${error.message}`);
    }
};

/**
 * Decrypts the given hash using the specified algorithm and key.
 * @param {string} hash - Encrypted text in the format "iv:encryptedText".
 * @param {string} [algorithm='aes-256-ctr'] - The decryption algorithm to use.
 * @param {string} [customSalt='defaultSalt'] - Custom salt for key derivation.
 * @returns {string} - Decrypted text.
 * @throws {ApiError} - Throws an error if decryption fails.
 */
const decrypt = (hash, algorithm = 'aes-256-ctr', customSalt = 'defaultSalt') => {
    if (typeof hash !== 'string' || !hash.includes(':')) {
        throw new ApiError(400, 'Invalid input: hash must be a valid format "iv:encryptedText".');
    }

    try {
        const [ivHex, encryptedTextHex] = hash.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, customSalt, 32);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedTextHex, 'hex')), decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        throw new ApiError(500, `Decryption failed: ${error.message}`);
    }
};

module.exports = { encrypt, decrypt };

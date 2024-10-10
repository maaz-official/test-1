const crypto = require('crypto');
const ApiError = require('../api/apiError');

/**
 * Encrypts the given text using AES-256-CTR algorithm.
 * @param {string} text - Text to encrypt.
 * @returns {string} - Encrypted text.
 */
const encrypt = (text) => {
    try {
        const algorithm = 'aes-256-ctr';
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        throw new ApiError(500, 'Encryption failed.');
    }
};

/**
 * Decrypts the given hash using AES-256-CTR algorithm.
 * @param {string} hash - Encrypted text.
 * @returns {string} - Decrypted text.
 * @throws {ApiError} - Throws an error if decryption fails.
 */
const decrypt = (hash) => {
    try {
        const [iv, encryptedText] = hash.split(':');
        const algorithm = 'aes-256-ctr';
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        throw new ApiError(500, 'Decryption failed.');
    }
};

module.exports = { encrypt, decrypt };

const fs = require('fs');
const path = require('path');
const ApiError = require('../api/apiError');

/**
 * Deletes a file at the specified path.
 * @param {string} filePath - Path to the file to delete.
 * @throws {ApiError} - Throws an error if file deletion fails.
 */
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw new ApiError(500, 'File deletion failed.');
        }
    });
};

/**
 * Gets the file extension from a filename.
 * @param {string} fileName - Filename to extract the extension from.
 * @returns {string} - File extension.
 */
const getFileExtension = (fileName) => {
    return path.extname(fileName);
};

module.exports = { deleteFile, getFileExtension };

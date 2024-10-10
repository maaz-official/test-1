const fs = require('fs/promises');
const path = require('path');
const ApiError = require('../api/apiError');
const { logger } = require('../utils/logger'); // Assume a logger utility is available

/**
 * Deletes a file at the specified path.
 * @param {string} filePath - Path to the file to delete.
 * @returns {Promise<void>} - Promise that resolves when the file is deleted.
 * @throws {ApiError} - Throws an error if file deletion fails.
 */
const deleteFile = async (filePath) => {
    try {
        // Validate file path
        if (typeof filePath !== 'string' || !filePath.trim()) {
            throw new ApiError(400, 'Invalid file path.');
        }

        // Check if the file exists
        await fs.access(filePath);
        
        // Delete the file
        await fs.unlink(filePath);
        logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new ApiError(404, 'File not found.');
        } else if (error.code === 'EACCES') {
            throw new ApiError(403, 'Permission denied to delete the file.');
        } else {
            throw new ApiError(500, 'File deletion failed: ' + error.message);
        }
    }
};

/**
 * Gets the file extension from a filename.
 * @param {string} fileName - Filename to extract the extension from.
 * @returns {string} - File extension or empty string if no extension.
 * @throws {ApiError} - Throws an error if the filename is invalid.
 */
const getFileExtension = (fileName) => {
    if (typeof fileName !== 'string' || !fileName.trim()) {
        throw new ApiError(400, 'Invalid filename.');
    }
    
    const ext = path.extname(fileName);
    logger.info(`Extracted file extension: ${ext} from filename: ${fileName}`);
    return ext;
};

/**
 * Validates the file type against allowed extensions.
 * @param {string} filePath - Path to the file to validate.
 * @param {Array<string>} allowedExtensions - List of allowed file extensions.
 * @throws {ApiError} - Throws an error if the file type is not allowed.
 */
const validateFileType = (filePath, allowedExtensions) => {
    const ext = getFileExtension(filePath);
    if (!allowedExtensions.includes(ext)) {
        throw new ApiError(415, `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    }
};

module.exports = {
    deleteFile,
    getFileExtension,
    validateFileType,
};

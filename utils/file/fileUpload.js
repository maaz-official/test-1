const multer = require('multer');
const ApiError = require('../api/apiError');
const path = require('path');
const fs = require('fs/promises');
const { logger } = require('../utils/logger'); // Assuming a logger utility is available

// Define allowed file types and size limit through environment variables
const ALLOWED_TYPES = process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 2 * 1024 * 1024; // Default: 2MB
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/';

// Ensure the upload directory exists
const ensureUploadDirExists = async (dir) => {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

// Configure storage with dynamic destination and unique filenames
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const dir = req.body.uploadDir || UPLOAD_DIR; // Allow dynamic upload dir or use default
        await ensureUploadDirExists(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.replace(/\s+/g, '-')}`;
        cb(null, uniqueSuffix);
    },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        logger.info(`File accepted: ${file.originalname}`);
        cb(null, true);
    } else {
        logger.error(`Invalid file type: ${file.mimetype} for file: ${file.originalname}`);
        cb(new ApiError(400, `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}.`), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE, // Dynamic size limit
    },
});

// Middleware for handling upload errors
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: err.message });
    } else if (err) {
        return res.status(err.statusCode || 400).json({ error: err.message });
    }
    next();
};

// Export the upload middleware and error handling middleware
module.exports = {
    upload,
    handleUploadErrors,
};

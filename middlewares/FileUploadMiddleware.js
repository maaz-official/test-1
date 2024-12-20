﻿
// FileUploadMiddleware.js
// Middleware for handling file uploads and validating file types and sizes.

const multer = require('multer');
const { apiError } = require('../utils/api/apiError');
const path = require('path');

// Define file storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new apiError(415, 'Unsupported file type'), false);
    }
    cb(null, true);
};

// Limit file size to 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;


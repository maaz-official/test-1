const multer = require('multer');
const ApiError = require('../api/apiError');

/**
 * Configures and returns a Multer instance for file uploads.
 * @returns {Multer} - Multer instance.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueSuffix);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Allowed types: JPEG, PNG, PDF.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
    },
});

module.exports = upload;

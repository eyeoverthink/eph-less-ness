const { ALLOWED_FORMATS, SIZE_LIMITS } = require('../config/upload.config');
const createError = require('http-errors');

/**
 * Middleware for validating file uploads
 * @param {string} type - Type of upload (thumbnails, audio, videos)
 */
const validateUpload = (type) => (req, res, next) => {
    if (!req.file && !req.files) {
        return next(createError(400, 'No file uploaded'));
    }

    const files = req.files ? Object.values(req.files).flat() : [req.file];

    try {
        files.forEach(file => {
            // Check file size
            if (file.size > SIZE_LIMITS[type]) {
                throw createError(400, `File too large. Maximum size for ${type} is ${SIZE_LIMITS[type] / (1024 * 1024)}MB`);
            }

            // Check file format
            const format = file.originalname.split('.').pop().toLowerCase();
            if (!ALLOWED_FORMATS[type].includes(format)) {
                throw createError(400, `Invalid file format. Allowed formats for ${type}: ${ALLOWED_FORMATS[type].join(', ')}`);
            }
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware for handling multipart form data with file size limits
 */
const uploadLimits = {
    fileSize: Math.max(...Object.values(SIZE_LIMITS)),
    files: 10
};

module.exports = {
    validateUpload,
    uploadLimits
};

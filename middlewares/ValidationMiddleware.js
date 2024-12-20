﻿
// ValidationMiddleware.js
// This middleware validates incoming requests using Joi schemas.

const Joi = require('joi');
const { apiError, HttpStatus } = require('../utils/api/apiError');

const validationMiddleware = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return next(new apiError(HttpStatus.BAD_REQUEST, 'Validation error', { details: error.details }));
    }
    next();
};

module.exports = validationMiddleware;


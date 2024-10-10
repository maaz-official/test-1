const Joi = require('joi');
const ApiError = require('../api/apiError');

/**
 * Centralized configuration for Joi validation schemas.
 */
const validationConfig = {
    username: Joi.string()
        .min(3)
        .max(30)
        .alphanum()
        .required()
        .messages({
            'string.empty': 'Username cannot be empty.',
            'string.min': 'Username must be at least {#limit} characters long.',
            'string.max': 'Username must not exceed {#limit} characters long.',
            'string.alphanum': 'Username must only contain alphanumeric characters.'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email cannot be empty.',
            'string.email': 'Email must be a valid email address.',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Password cannot be empty.',
            'string.min': 'Password must be at least {#limit} characters long.',
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Confirm password must match the original password.',
        }),
};

/**
 * Generates a Joi schema for user validation based on context.
 * @param {string} context - The context for validation (e.g., 'register', 'login').
 * @returns {Object} - Joi schema for user validation.
 */
const createUserSchema = (context) => {
    const commonSchema = {
        username: validationConfig.username,
        email: validationConfig.email,
        password: validationConfig.password,
    };

    switch (context) {
        case 'register':
            return Joi.object({
                ...commonSchema,
                confirmPassword: validationConfig.confirmPassword,
            });

        case 'login':
            return Joi.object({
                email: commonSchema.email,
                password: commonSchema.password,
            });

        // Add more contexts if necessary

        default:
            return Joi.object(commonSchema); // Fallback to common schema
    }
};

/**
 * Sanitizes user input to prevent injection attacks and formatting issues.
 * @param {Object} data - User data to sanitize.
 * @returns {Object} - Sanitized user data.
 */
const sanitizeInput = (data) => {
    return {
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(), // Convert to lowercase
        password: data.password, // Consider hashing the password later
        confirmPassword: data.confirmPassword,
    };
};

/**
 * Validates user input against a predefined schema.
 * @param {Object} data - User data to validate.
 * @param {string} context - The context for validation (e.g., 'register', 'login').
 * @returns {Object} - Validation result.
 * @throws {ApiError} - Throws an error if validation fails.
 */
const validateUserInput = (data, context) => {
    const schema = createUserSchema(context);
    
    const { error } = schema.validate(data, { abortEarly: false, allowUnknown: true }); // Validate all fields, allow unknown fields if necessary
    if (error) {
        const messages = error.details.map((detail) => detail.message);
        throw new ApiError(400, messages.join(', ')); // Return all error messages
    }

    const sanitizedData = sanitizeInput(data);
    return sanitizedData; // Return sanitized data
};

module.exports = {
    validateUserInput,
};

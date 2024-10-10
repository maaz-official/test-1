const Joi = require('joi');

/**
 * Validates user input against a predefined schema.
 * @param {Object} data - User data to validate.
 * @returns {Object} - Validation result.
 * @throws {ApiError} - Throws an error if validation fails.
 */
const validateUserInput = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        // Add more validation rules as needed
    });

    const { error } = schema.validate(data);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }
};

module.exports = {
    validateUserInput,
};

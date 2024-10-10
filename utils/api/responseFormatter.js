// api/responseFormatter.js

/**
 * Formats and sends a JSON response to the client.
 * @param {object} res - The response object from Express.
 * @param {number} statusCode - HTTP status code for the response.
 * @param {object} [data=null] - The data to send in the response. Defaults to null.
 * @param {string} [message=''] - A message to provide additional context about the response. Defaults to an empty string.
 * @param {object} [meta={}] - Optional metadata to include with the response.
 * @param {object} [errors=null] - Optional errors to include, if applicable. Defaults to null.
 * @param {string} [requestId] - Optional unique identifier for the request. Useful for tracing.
 */
const responseFormatter = (res, statusCode, data = null, message = '', meta = {}, errors = null, requestId = null) => {
    // Ensure status code is a valid HTTP status code
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
        throw new Error('Invalid HTTP status code');
    }

    // Construct the response object
    const response = {
        status: statusCode,
        message: message || (statusCode >= 200 && statusCode < 300 ? 'Success' : 'Error'),
        data,
        meta: {
            ...meta,
            requestId, // Include request ID if provided
            version: '1.0.0', // Specify API version
        },
    };

    // Include errors if they exist
    if (errors) {
        response.errors = errors;
    }

    // Optional: Log the response (can be enhanced with logging libraries)
    console.log('Response:', JSON.stringify(response));

    // Send the response
    return res.status(statusCode).json(response);
};

module.exports = responseFormatter;
// usage: // In a successful response
// responseFormatter(res, httpStatusCodes.OK, { user: userData }, 'User retrieved successfully', {}, null, req.id);

// // In an error response
// responseFormatter(res, httpStatusCodes.BAD_REQUEST, null, 'Invalid input data', {}, { inputField: 'email', message: 'Email is required' }, req.id);
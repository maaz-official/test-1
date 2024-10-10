// api/apiError.js

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

/**
 * Custom error handling class to manage API errors more effectively.
 */
export class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code representing the error.
     * @param {string} message - A descriptive message for the error.
     * @param {Object} [details] - Additional information related to the error (e.g., input fields).
     * @param {boolean} [isOperational=true] - Indicates if the error is operational or programming error.
     */
    constructor(statusCode, message, details = {}, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.details = details; // Additional details about the error
        this.isOperational = isOperational; // operational errors vs programming errors
        Error.captureStackTrace(this, this.constructor); // capture the stack trace

        // Optional logging for non-operational errors
        if (!isOperational) {
            this.logError();
        }
    }

    /**
     * Logs the error details for debugging.
     * This can be further enhanced to log to external monitoring services.
     */
    logError() {
        console.error(`Error: ${this.message}`);
        console.error(`Status Code: ${this.statusCode}`);
        console.error(`Details: ${JSON.stringify(this.details)}`);
        console.error(`Stack Trace: ${this.stack}`);
        // Optionally, integrate with logging services like Winston or Loggly
    }
}

/**
 * Universal error handler function to simplify error throwing.
 * @param {string} message - The error message.
 * @param {number} [statusCode] - The HTTP status code. Defaults to 500.
 * @param {Object} [details] - Additional information related to the error.
 * @param {boolean} [isOperational] - Indicates if the error is operational. Defaults to true.
 * @throws {ApiError} - Throws an instance of ApiError.
 */
export const apiError = (statusCode = HttpStatus.INTERNAL_SERVER_ERROR, message, details = {}, isOperational = true) => {
    throw new ApiError(statusCode, message, details, isOperational);
};
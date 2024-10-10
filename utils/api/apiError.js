// Custom error handling class
// api/apiError.js
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // indicates if the error is operational or programming error
    }
}
module.exports = ApiError;

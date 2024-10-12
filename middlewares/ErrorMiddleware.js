const { ApiError, HttpStatus } = require('../utils/api/apiError');

/**
 * Centralized error handling middleware for Express applications.
 * Handles various error types, logs them, and responds with structured JSON.
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || 'An unexpected error occurred';
  let errorType = err.type || 'ApiError';
  let errorDetails = null;

  // MongoDB Duplicate Key Error
  if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorType = 'DuplicateKeyError';
    errorMessage = 'Resource already exists';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorType = 'ValidationError';
    errorMessage = 'Validation failed';
    errorDetails = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
      kind: error.kind,
    }));
  }

  // Handle custom ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorType = err.constructor.name;
    errorDetails = err.details || null;
  }

  // Log error in development (if necessary)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Error: ${errorMessage}\nStack: ${err.stack}`);
  }

  const response = {
    success: false,
    error: {
      message: errorMessage,
      type: errorType,
      ...(errorDetails && { details: errorDetails }),
    },
  };

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;

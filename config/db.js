const mongoose = require('mongoose');
const { getConfig } = require('../utils/helpers/config');
const logger = require('../utils/logging/logger');
const bootstrapAdmin = require('../utils/auth/bootstrapAdmin');

// MongoDB URI from environment variables, with fallback to localhost
const mongoURI = getConfig('MONGO_URI', 'mongodb://localhost:27017/insport_app');

// MongoDB connection options for performance tuning and scalability
const mongooseOptions = {
    maxPoolSize: getConfig('MONGO_POOL_SIZE', 10), // Maximum number of connections in the pool
    connectTimeoutMS: getConfig('MONGO_CONNECT_TIMEOUT', 10000), // Timeout for initial connection (in ms)
    socketTimeoutMS: getConfig('MONGO_SOCKET_TIMEOUT', 45000), // Timeout for socket inactivity (in ms)
    autoIndex: false, // Disable auto-indexing in production for better performance
    retryWrites: true, // Automatically retry write operations
    w: 'majority', // Write acknowledgment
};

// Function to connect to MongoDB with retry logic and advanced options
const connectDB = async () => {
    let retries = getConfig('MONGO_RETRY_LIMIT', 5); // Number of retries before giving up
    const retryDelay = getConfig('MONGO_RETRY_DELAY', 5000); // Delay between retries (in ms)

    while (retries > 0) {
        try {
            // Try connecting to the database
            await mongoose.connect(mongoURI, mongooseOptions);
            logger.info('MongoDB connected successfully');
            mongoose.connection.on('connected', () => {
                logger.info('MongoDB connection established');
            });

            // Attach event listeners for connection errors, disconnections, etc.
            mongoose.connection.on('error', (err) => {
                logger.error(`MongoDB connection error: ${err.message}`);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected. Attempting reconnection...');
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected successfully');
            });
            await bootstrapAdmin();
            return; 
        } catch (error) {
            retries -= 1;
            logger.error(`MongoDB connection error: ${error.message}. Retrying in ${retryDelay / 1000}s... (${retries} retries left)`);

            if (retries === 0) {
                logger.error('MongoDB connection failed after multiple attempts. Exiting...');
                process.exit(1); 
            }

            await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
        }
    }
};

const gracefulDBShutdown = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed gracefully');
        process.exit(0);
    } catch (error) {
        logger.error(`Error during MongoDB graceful shutdown: ${error.message}`);
        process.exit(1);
    }
};

process.on('SIGINT', gracefulDBShutdown);
process.on('SIGTERM', gracefulDBShutdown);
module.exports = { connectDB, gracefulDBShutdown };

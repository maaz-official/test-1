const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan'); 
const cookieParser = require('cookie-parser');

const logger = require('./utils/logging/logger.js'); 
const { getConfig } = require('./utils/helpers/config.js'); 
const errorMiddleware = require('./middlewares/ErrorMiddleware.js');
const routes = require('./routes/index.js'); 
const { connectDB, gracefulDBShutdown} = require('./config/db.js'); 
const { secureAttachUserDetails } = require('./middlewares/AuthMiddleware.js');
dotenv.config();

// Initialize express app
const app = express();

// Security Middlewares
app.use(cors()); // Enable CORS
app.use(helmet()); // Add Helmet for HTTP security headers
app.use(compression()); // Add compression to improve response times
app.use(cookieParser());
app.use(secureAttachUserDetails);

// Limit repeated requests to public APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

// Setup for logging incoming requests
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()), 
  },
})); 

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Route Middlewares (modularized)
app.use('/users', routes.userRoutes);
app.use('/auth', routes.authRoutes);
// app.use('/events', routes.eventRoutes);
// app.use('/players', routes.playerRoutes);
// app.use('/hosts', routes.hostRoutes);
// app.use('/map', routes.mapRoutes);
// app.use('/notifications', routes.notificationRoutes);
// app.use('/reviews', routes.reviewRoutes);
// app.use('/leaderboard', routes.leaderboardRoutes);
// app.use('/analytics', routes.analyticsRoutes);
// app.use('/files', routes.fileUploadRoutes);
// app.use('/admin', routes.adminRoutes);

// Root route (Welcome message)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Sports Event API!' });
});

// Health check endpoint (used by monitoring tools like Kubernetes or AWS ELB)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 404 handling for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware (centralized error handling)
app.use(errorMiddleware);

// Get port from config or environment variable
const PORT = getConfig('PORT', 5000);

// Start the server and log the running status
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
  try {
    logger.info('Shutting down server gracefully...');
    
    // Close the MongoDB connection
    gracefulDBShutdown()
    
    // Stop the server
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit if not closed within 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);

  } catch (error) {
    // logger.error(`Error during shutdown: ${error.message}`);
    console.log("aaaaaaa",error.message)
    process.exit(1);
  }
};

// Listen for termination signals to handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


// AdminService.js
// This service handles admin-related business logic, including user management and app-wide analytics, constants like sport maangement.
const { Sport } = require('../models');
const { ApiError, HttpStatus } = require('../utils/api/apiError');
const redis = require('../utils/cache/redisClient');
const logger = require('../utils/logging/logger');
const mongoose = require('mongoose');

// Create a new sport
exports.createSport = async (sportData) => {
    const { name, description, icon_url } = sportData;

    // Validate the input data (e.g., name and icon_url should be valid)
    if (!name || !icon_url) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Name and Icon URL are required');
    }

    // Check if sport already exists
    const existingSport = await Sport.findOne({ name }).lean();
    if (existingSport) {
        throw new ApiError(HttpStatus.CONFLICT, 'Sport already exists');
    }

    // Create a new sport within a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newSport = new Sport({ name, description, icon_url });
        const savedSport = await newSport.save({ session });
        await redis.del('all_sports_with_event_counts');

        await session.commitTransaction();
        logger.info(`New sport created: ${savedSport.name}`);
        return savedSport;
    } catch (error) {
        await session.abortTransaction();
        logger.error('Error creating sport:', error);
        throw error;
    } finally {
        session.endSession();
    }
};

// Get all sports (with caching)
exports.getAllSports = async () => {
    const cacheKey = 'all_sports_with_event_counts';

    // Check if the data exists in cache
    try {
        const cachedSports = await redis.get(cacheKey);
        if (cachedSports) {
            logger.info('Returning sports from cache');
            return JSON.parse(cachedSports);
        }

        // If not in cache, fetch from database
        const sports = await Sport.getAllSportsWithEventCounts();
        await redis.set(cacheKey, JSON.stringify(sports), 'EX', 60 * 60); // Stringify data and set expiry time (1 hour)

        logger.info('Returning sports from database and storing in cache');
        return sports;
    } catch (error) {
        logger.error('Error fetching sports:', error);
        throw error;
    }
};

// Get a sport by ID
exports.getSportById = async (sportId) => {
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid sport ID');
    }
    const cacheKey = `sport_${sportId}`;
    try {
        const cachedSport = await redis.get(cacheKey);
        if (cachedSport) {
            logger.info(`Returning sport with ID ${sportId} from cache`);
            return JSON.parse(cachedSport);
        }

        const sport = await Sport.findById(sportId).populate('events').lean();
        if (!sport) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Sport not found');
        }
        await redis.set(cacheKey, JSON.stringify(sport), 'EX', 60 * 60);

        return sport;
    } catch (error) {
        logger.error(`Error fetching sport with ID ${sportId}:`, error);
        throw error;
    }
};

// Update a sport by ID
exports.updateSport = async (sportId, updatedData) => {
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid sport ID');
    }
    const cacheKey = `sport_${sportId}`;
    try {
        const sport = await Sport.findByIdAndUpdate(sportId, updatedData, { new: true }).lean();
        if (!sport) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Sport not found');
        }
        await redis.del('all_sports_with_event_counts');
        await redis.del(cacheKey);
        logger.info(`Sport updated: ${sport.name}`);
        return sport;
    } catch (error) {
        logger.error(`Error updating sport with ID ${sportId}:`, error);
        throw error;
    }
};

// Delete a sport by ID (with transaction)
exports.deleteSport = async (sportId) => {
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid sport ID');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const sport = await Sport.findByIdAndDelete(sportId, { session }).lean();
        if (!sport) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Sport not found');
        }
        await redis.del('all_sports_with_event_counts');
        await session.commitTransaction();
        logger.info(`Sport deleted: ${sport.name}`);
        return { message: 'Sport deleted successfully' };
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Error deleting sport with ID ${sportId}:`, error);
        throw error;
    } finally {
        session.endSession();
    }
};

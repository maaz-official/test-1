const mongoose = require('mongoose');
const { Event, User, Participation, Location } = require('../models');
const { ApiError, HttpStatus } = require('../utils/api/apiError');
const sanitizeHtml = require('sanitize-html');
const redis = require('../utils/cache/redisClient');
const logger = require('../utils/logging/logger');
const handleProfanity = require('../utils/profanity/profanityFilter');
// const profanityUtil = require('profanity-util');



/**
 * Cache helper function to interact with Redis
 */
const cache = {
    async get(key) {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    },
    async set(key, value, ttl = 600) { // Default TTL is 10mint
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
    },
    async del(key) {
        await redis.del(key);
    },
};

/**
 * Create a new event.
 * @param {Object} eventData - Data for the new event.
 * @param {String} hostId - ID of the user creating the event.
 */
exports.createEvent = async (eventData, hostId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        eventData.title = sanitizeHtml(eventData.title);
        eventData.description = sanitizeHtml(eventData.description);

        const { latitude, longitude } = eventData.location;
        let location = await Location.findOne({ latitude, longitude }).session(session);

        // Create or update the location
        if (!location) {
            location = new Location({
                name: eventData.location.name,
                latitude,
                longitude,
                address: eventData.location.address,
                description: eventData.location.description,
                accuracy: eventData.location.accuracy,
                tags: eventData.location.tags || [],
                status: 'active',
                trackingEnabled: true,
                geofence: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                    radius: eventData.location.geofence.radius || 0
                }
            });
            await location.save({ session });
        }

        // Create the event
        const event = new Event({
            ...eventData,
            host_user_id: hostId,
            location_id: location._id,
        });
        await event.save({ session });

        // Commit transaction
        await session.commitTransaction();

        // Clear related cache
        await cache.del(`events:host:${hostId}`);
        await cache.del('events:popular');
        await cache.del(`sport_${event.sport_id}`);
        
        return event;
    } catch (error) {
        await session.abortTransaction();
        throw error; // Re-throw the error for higher-level handling
    } finally {
        session.endSession();
    }
};


/**
 * Get event details by event ID.
 */
exports.getEventDetails = async (eventId) => {
    const cacheKey = `event:${eventId}`;
    // let event = await cache.get(cacheKey);
let event;
    if (!event) {
        event = await Event.findById(eventId)
        .populate({
            path: 'host_user_id', // Populate host user
            select: 'profile', // Only need to select the profile virtual
            populate: {
              path: 'profile', // Populate the user's profile
              select: 'first_name last_name experience_level profile_picture_url' // Select fields from UserProfile
            }
          })
        .populate({
            path: 'participants', // Populate the participants array
            populate: {
            path: 'user_id', // Populate the user_id for each participant
            select: 'profile', // Only need to select the profile virtual
            populate: {
                path: 'profile', // Populate the user's profile
                select: 'first_name last_name experience_level profile_picture_url' // Select fields from UserProfile
            }
            }
        })
        .populate('location_id') // Populate location
        .populate('sport_id') // Populate sport
        .exec();

        if (!event) {
            throw new ApiError(404, 'Event not found');
        }

        // Cache the event details
        await cache.set(cacheKey, event);
    }

    // Check if participants exist and handle accordingly
    if (!event.participants || event.participants.length === 0) {
        event.participants = []; // Ensure it's an empty array
    } else {
        // If participants exist, check for profiles and add default values if not found
        event.participants = event.participants.map(participant => {
            const { user_id } = participant;
            const fullName = user_id ? `${user_id.first_name || 'Unknown'} ${user_id.last_name || ''}`.trim() : 'Unknown User';
            return {
                ...participant.toObject(), // Convert to plain object to avoid Mongoose doc methods
                fullName,
                profile_picture_url: user_id?.profile?.profile_picture_url || 'default_picture_url.png' // Provide a default profile picture if not available
            };
        });
    }

    return event;
};
/**
 * Update an event's details.
 */
exports.updateEvent = async (eventId, updateData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Sanitize the input
        if (updateData.title) updateData.title = sanitizeHtml(updateData.title);
        if (updateData.description) updateData.description = sanitizeHtml(updateData.description);

        // Find the event
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            throw new ApiError(404, 'Event not found');
        }

        // Update location if any location details are present in updateData
        if (updateData.location) {
            const { latitude, longitude, name, address, description, accuracy, tags, geofence } = updateData.location;

            // Find the existing location using the event's current location_id
            let location = await Location.findById(event.location_id).session(session);
            if (!location) {
                // If the location doesn't exist, create a new one
                location = new Location({
                    name: name || '', // Default to empty string if not provided
                    latitude: latitude || 0, // Default to 0 if not provided
                    longitude: longitude || 0, // Default to 0 if not provided
                    address: address || '', // Default to empty string if not provided
                    description: description || '', // Default to empty string if not provided
                    accuracy: accuracy || 0, // Default to 0 if not provided
                    tags: tags || [],
                    status: 'active',
                    trackingEnabled: true,
                    geofence: {
                        type: 'Point',
                        coordinates: [longitude || 0, latitude || 0], // Default to 0 if not provided
                        radius: geofence?.radius || 0 // Default to 0 if radius is not provided
                    }
                });
                await location.save({ session });
                event.location_id = location._id; // Update the event to link to the new location
            } else {
                // Update the existing location if it exists
                if (name) location.name = name; // Update only if provided
                if (address) location.address = address; // Update only if provided
                if (description) location.description = description; // Update only if provided
                if (accuracy !== undefined) location.accuracy = accuracy; // Update only if provided
                if (tags) location.tags = tags; // Update only if provided
                if (latitude !== undefined && longitude !== undefined) {
                    location.latitude = latitude; // Update latitude only if provided
                    location.longitude = longitude; // Update longitude only if provided
                    // Update geofence only if latitude and longitude are provided
                    location.geofence = {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                        radius: geofence?.radius || location.geofence.radius // Update radius only if provided
                    };
                }
                await location.save({ session }); // Save changes to the existing location
            }
        }

        // Update other fields of the event based on the provided updateData
        Object.keys(updateData).forEach(key => {
            if (key !== 'location') {
                event[key] = updateData[key]; // Update fields directly on the event
            }
        });

        await event.save({ session }); // Save the updated event
        await session.commitTransaction();
        return event; // Return the updated event
    } catch (error) {
        await session.abortTransaction();
        throw error; // Rethrow the error after aborting
    } finally {
        session.endSession(); // End the session
    }
};

/**
 * Cancel an event.
 */
exports.cancelEvent = async (eventId, currentUser) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Check if the user is an admin or the host of the event
    if (currentUser.role !== 'admin' && event.host_user_id.toString() !== currentUser._id.toString()) {
        throw new ApiError(403, 'You do not have permission to cancel this event');
    }

    // Cancel the event
    event.status = 'cancelled';
    await event.save();

    // Invalidate cache
    await cache.del(`event:${eventId}`);
    await cache.del(`events:host:${event.host_user_id}`);

    return 'Event cancelled successfully';
};

/**
 * Get all events (with Redis caching).
 */
exports.getAllEvents = async () => {
    const cacheKey = 'events:all';
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find()
            .populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Search for events based on query parameters (with Redis caching).
 */
exports.searchEvents = async (req) => {
    const { latitude, longitude, radius, sportId, isUpcoming, isPopular, date } = req.query;

    const searchCriteria = {}; // Initialize an empty search criteria object
    const today = new Date();

    // If sportId is provided, add sport filter
    if (sportId) searchCriteria.sport_id = sportId;

    // If date is provided, filter events after the provided date, or filter by upcoming events
    if (date) {
        searchCriteria.date_time = { $gte: new Date(date) };
    } else if (isUpcoming === 'true') {
        searchCriteria.date_time = { $gte: today }; // Only future events
    }

    // Geolocation filter if latitude, longitude, and radius are provided
    if (latitude && longitude && radius) {
        searchCriteria.coordinates = {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radius / 6378.1], // Convert radius to kilometers
            },
        };
    }

    // If popular events are requested, sort them by participants count
    let sort = {};
    if (isPopular === 'true') {
        sort = { participants_count: -1 }; // Sort by most participants or views
    }

    // Create a cache key based on the search criteria to uniquely cache this query
    const cacheKey = `events:search:${JSON.stringify(searchCriteria)}:${JSON.stringify(sort)}`;
    
    // Check if cached results exist
    let events = await redis.get(cacheKey);
    
    if (!events) {
        // Query the database with the search criteria and sorting
        events = await Event.find(searchCriteria)
            .sort(sort) // Apply sorting if specified
            .populate('host_user_id', 'first_name last_name');
        
        // Cache the result for 1 hour (3600 seconds)
        await redis.set(cacheKey, JSON.stringify(events), 'EX', 3600);
    } else {
        // Parse the cached string back into a JavaScript object
        events = JSON.parse(events);
    }

    return events;
};
/**
 * Get upcoming events happening today or in the future (with Redis caching).
 */
exports.getUpcomingEvents = async () => {
    const cacheKey = 'events:upcoming';
    let events = await cache.get(cacheKey);

    if (!events) {
        const today = new Date();
        events = await Event.find({ date_time: { $gte: today }, status: { $ne: 'cancelled' } })
            .populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Update event status (e.g., mark as ongoing, completed, etc.).
 */
exports.updateEventStatus = async (eventId, status) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    event.status = status;
    await event.save();

    // Invalidate cache for this event
    await cache.del(`event:${eventId}`);

    return event;
};

/**
 * Update real-time event live status.
 */
exports.updateEventLiveStatus = async (eventId, is_live) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    event.is_live = is_live;
    await event.save();

    // Invalidate cache for this event
    await cache.del(`event:${eventId}`);

    return event;
};

/**
 * Get user participation history.
 */
exports.getUserParticipationHistory = async (userId) => {
    const cacheKey = `user:${userId}:participation`;
    let participations = await cache.get(cacheKey);

    if (!participations) {
        participations = await Participation.find({ user_id: userId })
            .populate('event_id', 'title date_time location_id')
            .populate('user_id', 'first_name last_name');
        if (!participations) {
            throw new ApiError(404, 'No participation history found for this user.');
        }
        await cache.set(cacheKey, participations, 3600); // Cache for 1 hour
    }

    return participations;
};

/**
 * Get events hosted by a specific user (host) (with Redis caching).
 */
exports.getEventsByHost = async (hostId) => {
    const cacheKey = `events:host:${hostId}`;
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find({ host_user_id: hostId })
            .populate('participants.user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Get events by sport (with Redis caching).
 */
exports.getEventsBySport = async (sportId) => {
    const cacheKey = `events:sport:${sportId}`;
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find({ sport_id: sportId })
            .populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Get events near a specific location using geolocation (with Redis caching).
 */
exports.getEventsNearLocation = async (latitude, longitude, radius) => {
    const cacheKey = `events:nearby:${latitude}:${longitude}:${radius}`;
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find({
            coordinates: {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], radius / 6378.1], // Radius in kilometers
                },
            },
        }).populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Get popular events (e.g., based on participation count) (with Redis caching).
 */
exports.getPopularEvents = async () => {
    const cacheKey = 'events:popular';
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find().sort({ participants_count: -1 }).limit(10)
            .populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
    }

    return events;
};

/**
 * Invite users to an event.
 */
exports.inviteUsersToEvent = async (eventId, users) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    // Add logic to send invitations (e.g., via email or push notifications)
};

/**
 * Remove a participant from an event.
 */
exports.removeParticipant = async (eventId, participantId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    event.participants = event.participants.filter(p => p.user_id.toString() !== participantId);
    await event.save();

    // Invalidate cache
    await cache.del(`event:${eventId}`);
};

/**
 * Add participants to an event.
 */
exports.addParticipants = async (eventId, participants) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    event.participants.push(...participants);
    await event.save();

    // Invalidate cache
    await cache.del(`event:${eventId}`);

    return event.participants;
};

/**
 * Update the privacy setting of an event (public/private).
 */
exports.updateEventPrivacy = async (eventId, privacySetting) => {
    const event = await Event.findByIdAndUpdate(eventId, { privacy_setting: privacySetting }, { new: true });
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Invalidate cache
    await cache.del(`event:${eventId}`);

    return event;
};

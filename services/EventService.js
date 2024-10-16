const { Event, User, Participation } = require('../models');
const { ApiError } = require('../utils/api/apiError');
const redis = require('../utils/cache/redisClient');
const logger = require('../utils/logging/logger');

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
    const event = new Event({
        ...eventData,
        host_user_id: hostId,
    });
    await event.save();

    // Clear related cache (invalidate event cache and popular events)
    await cache.del(`events:host:${hostId}`);
    await cache.del('events:popular');

    return event;
};

/**
 * Get event details by event ID.
 */
exports.getEventDetails = async (eventId) => {
    const cacheKey = `event:${eventId}`;
    let event = await cache.get(cacheKey);

    if (!event) {
        event = await Event.findById(eventId)
            .populate('host_user_id', 'first_name last_name')
            .populate('participants.user_id', 'first_name last_name');

        if (!event) {
            throw new ApiError(404, 'Event not found');
        }

        // Cache the result for future queries
        await cache.set(cacheKey, event);
    }

    return event;
};

/**
 * Update an event's details.
 */
exports.updateEvent = async (eventId, updateData) => {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
    if (!updatedEvent) {
        throw new ApiError(404, 'Event not found');
    }

    // Invalidate cache for this event
    await cache.del(`event:${eventId}`);

    return updatedEvent;
};

/**
 * Cancel an event.
 */
exports.cancelEvent = async (eventId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }
    event.status = 'cancelled';
    await event.save();

    // Invalidate cache
    await cache.del(`event:${eventId}`);
    await cache.del(`events:host:${event.host_user_id}`);
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
exports.searchEvents = async (query) => {
    const searchCriteria = {};
    if (query.sport) searchCriteria.sport_id = query.sport;
    if (query.date) searchCriteria.date_time = { $gte: query.date };

    const cacheKey = `events:search:${JSON.stringify(searchCriteria)}`;
    let events = await cache.get(cacheKey);

    if (!events) {
        events = await Event.find(searchCriteria)
            .populate('host_user_id', 'first_name last_name');
        await cache.set(cacheKey, events, 3600); // Cache for 1 hour
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

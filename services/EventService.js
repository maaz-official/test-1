// EventService.js
// This service handles the creation, updating, deletion, and retrieval of events.


const { Event, User, Participation } = require('../models');
const { ApiError } = require('../utils/api/apiError');

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
    return event;
};

/**
 * Get event details by event ID.
 */
exports.getEventDetails = async (eventId) => {
    const event = await Event.findById(eventId)
        .populate('host_user_id', 'first_name last_name')
        .populate('participants.user_id', 'first_name last_name');
    if (!event) {
        throw new ApiError(404, 'Event not found');
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
};

/**
 * Get all events.
 */
exports.getAllEvents = async () => {
    const events = await Event.find().populate('host_user_id', 'first_name last_name');
    return events;
};

/**
 * Search for events based on query parameters.
 */
exports.searchEvents = async (query) => {
    const searchCriteria = {}; // Customize based on your query structure
    if (query.sport) {
        searchCriteria.sport_id = query.sport;
    }
    if (query.date) {
        searchCriteria.date_time = { $gte: query.date };
    }
    const events = await Event.find(searchCriteria).populate('host_user_id', 'first_name last_name');
    return events;
};


/**
 * Get upcoming events happening today or in the future.
 */
exports.getUpcomingEvents = async () => {
    const today = new Date();
    const events = await Event.find({ date_time: { $gte: today }, status: { $ne: 'cancelled' } })
        .populate('host_user_id', 'first_name last_name');
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
    return event;
};

/**
 * Get user participation history.
 */
exports.getUserParticipationHistory = async (userId) => {
    const participations = await Participation.find({ user_id: userId })
        .populate('event_id', 'title date_time location_id')
        .populate('user_id', 'first_name last_name');
    if (!participations) {
        throw new ApiError(404, 'No participation history found for this user.');
    }
    return participations;
};



/**
 * Get events hosted by a specific user (host).
 */
exports.getEventsByHost = async (hostId) => {
    const events = await Event.find({ host_user_id: hostId }).populate('participants.user_id', 'first_name last_name');
    return events;
};

/**
 * Get events by sport.
 */
exports.getEventsBySport = async (sportId) => {
    const events = await Event.find({ sport_id: sportId }).populate('host_user_id', 'first_name last_name');
    return events;
};

/**
 * Get events near a specific location using geolocation.
 */
exports.getEventsNearLocation = async (latitude, longitude, radius) => {
    const events = await Event.find({
        coordinates: {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radius / 6378.1], // Radius in kilometers
            },
        },
    }).populate('host_user_id', 'first_name last_name');
    return events;
};

/**
 * Get popular events (e.g., based on participation count).
 */
exports.getPopularEvents = async () => {
    const events = await Event.find().sort({ participants_count: -1 }).limit(10).populate('host_user_id', 'first_name last_name');
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
    return event;
};

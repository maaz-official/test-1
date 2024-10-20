// EventController.js
// Handles event creation, updating, retrieving, and participation management

const { EventService } = require('../services');
const { ApiError } = require('../utils/api/apiError');

/**
 * Create a new event.
 */
exports.createEvent = async (req, res, next) => {
    try {
        const event = await EventService.createEvent(req.body, req.user._id);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

/**
 * Get details of a specific event.
 */
exports.getEventDetails = async (req, res, next) => {
    try {
        const event = await EventService.getEventDetails(req.params.eventId);
        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
};

/**
 * Update event details.
 */
exports.updateEvent = async (req, res, next) => {
    try {
        const updatedEvent = await EventService.updateEvent(req.params.eventId, req.body);
        res.status(200).json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel an event.
 */
exports.cancelEvent = async (req, res, next) => {
    try {
        const message = await EventService.cancelEvent(req.params.eventId, req.user);
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all events.
 */
exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await EventService.getAllEvents();
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Search for events based on criteria.
 */
exports.searchEvents = async (req, res, next) => {
    try {
        const events = await EventService.searchEvents(req);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Get events happening today or upcoming.
 */
exports.getUpcomingEvents = async (req, res, next) => {
    try {
        const events = await EventService.getUpcomingEvents();
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Update event status (e.g., mark event as ongoing, completed).
 */
exports.updateEventStatus = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;
        const updatedEvent = await EventService.updateEventStatus(eventId, status);
        res.status(200).json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

/**
 * Update real-time event live status (e.g., mark as live or check-in).
 */
exports.updateEventLiveStatus = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const liveStatus = req.body.is_live;
        const updatedEvent = await EventService.updateEventLiveStatus(eventId, liveStatus);
        res.status(200).json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user participation history.
 */
exports.getUserParticipationHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const events = await EventService.getUserParticipationHistory(userId);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Get events hosted by a specific host.
 */
exports.getEventsByHost = async (req, res, next) => {
    try {
        const events = await EventService.getEventsByHost(req.params.hostId);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Get events by a specific sport.
 */
exports.getEventsBySport = async (req, res, next) => {
    try {
        const events = await EventService.getEventsBySport(req.params.sportId);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Get events near a specific location.
 */
exports.getEventsNearLocation = async (req, res, next) => {
    try {
        const { latitude, longitude, radius } = req.query;
        const events = await EventService.getEventsNearLocation(latitude, longitude, radius);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Get popular events.
 */
exports.getPopularEvents = async (req, res, next) => {
    try {
        const events = await EventService.getPopularEvents();
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * Invite users to an event.
 */
exports.inviteUsersToEvent = async (req, res, next) => {
    try {
        await EventService.inviteUsersToEvent(req.params.eventId, req.body.users);
        res.status(200).json({ message: 'Invitations sent' });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove a participant from an event.
 */
exports.removeParticipant = async (req, res, next) => {
    try {
        await EventService.removeParticipant(req.params.eventId, req.params.participantId);
        res.status(200).json({ message: 'Participant removed' });
    } catch (error) {
        next(error);
    }
};

/**
 * Add participants to an event.
 */
exports.addParticipants = async (req, res, next) => {
    try {
        const participants = await EventService.addParticipants(req.params.eventId, req.body.participants);
        res.status(200).json(participants);
    } catch (error) {
        next(error);
    }
};

/**
 * Update the privacy settings of an event.
 */
exports.updateEventPrivacy = async (req, res, next) => {
    try {
        const updatedEvent = await EventService.updateEventPrivacy(req.params.eventId, req.body.privacy_setting);
        res.status(200).json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

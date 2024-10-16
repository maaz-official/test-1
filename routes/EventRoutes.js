// EventRoutes.js
// Handles routes for event creation, updating, retrieving, participation, and management

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/AuthMiddleware');
const { EventController } = require('../controllers');

// Route to create a new event
router.post('/', requireAuth, EventController.createEvent);

// Route to get event details by eventId
router.get('/:eventId', EventController.getEventDetails);

// Route to update event details by eventId
router.put('/:eventId', requireAuth, EventController.updateEvent);

// Route to cancel an event
router.put('/:eventId/cancel', requireAuth, EventController.cancelEvent);

// Route to get a list of all events (for admin or general event discovery)
router.get('/', EventController.getAllEvents);

// Route to filter events by location, type, or time
router.get('/search', EventController.searchEvents);

// Route to get events happening today or upcoming
router.get('/upcoming', EventController.getUpcomingEvents);

// Route to get all events hosted by a specific user (for a user's dashboard)
router.get('/host/:hostId', requireAuth, EventController.getEventsByHost);

// Route to get events for a specific sport (e.g., filter by sport type)
router.get('/sport/:sportId', EventController.getEventsBySport);

// Route to get events by a geolocation radius (using longitude, latitude)
router.get('/nearby', EventController.getEventsNearLocation);

// Route to get a list of events a user has participated in
router.get('/user/:userId/participated', requireAuth, EventController.getUserParticipationHistory);

// Route to manage event status (e.g., mark event as ongoing, completed, etc.)
router.put('/:eventId/status', requireAuth, requireRole(['host', 'admin']), EventController.updateEventStatus);

// Route for host to update real-time status (e.g., check-in, mark as live)
router.put('/:eventId/live', requireAuth, requireRole(['host']), EventController.updateEventLiveStatus);

// Route to get popular events based on participation or views
router.get('/popular', EventController.getPopularEvents);

// Route to invite users to join an event
router.post('/:eventId/invite', requireAuth, EventController.inviteUsersToEvent);

// Route to allow hosts to remove participants from an event
router.put('/:eventId/participants/:participantId/remove', requireAuth, requireRole(['host']), EventController.removeParticipant);

// Route to add participants (used for admins or reserved seats)
router.post('/:eventId/participants', requireAuth, EventController.addParticipants);

// Route to update event privacy settings (public/private)
router.put('/:eventId/privacy', requireAuth, EventController.updateEventPrivacy);

// Cancel Event: Hosts or admins can cancel events.
// Search and Filter Events: Ability to search and filter events by location, time, or type.
// Events Near Location: Geolocation-based search for nearby events.
// Upcoming and Popular Events: Retrieve events happening soon or those with high popularity.
// Host Events Management: Hosts can manage their events, including marking them live or completed.
// User Participation History: A route for users to track their participation.
// Invite Users: Hosts can invite other users to join their events.
// Manage Participants: Hosts or admins can remove participants or add new ones.
// Privacy Settings: Control over event privacy (public or private).
module.exports = router;


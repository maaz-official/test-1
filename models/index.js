
// index.js
// This file aggregates and exports all Mongoose models for easy import.

const EventAnalytics = require('./eventAnalytics');
const Event = require('./events');
const Location = require('./location');
const Map = require('./map');
const Notification = require('./notifications');
const Participation = require('./participation');
const Review = require('./reviews');
const Sport = require('./sports');
const Team = require('./team');
const TeamMembership = require('./teamMembership');
const UserFavoriteSport = require('./userFavoriteSport');
const UserProfile = require('./userProfile');
const User = require('./users');

// Export all models
module.exports = {
    EventAnalytics,
    Event,
    Location,
    Map,
    Notification,
    Participation,
    Review,
    Sport,
    Team,
    TeamMembership,
    UserFavoriteSport,
    UserProfile,
    User
};


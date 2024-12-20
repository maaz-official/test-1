﻿
// index.js
// This file aggregates and exports all service files for easy import.

const AuthService = require('./AuthService');
const UserService = require('./UserService');
const EventService = require('./EventService');
const PlayerService = require('./PlayerService');
const HostService = require('./HostService');
const MapService = require('./MapService');
const NotificationService = require('./NotificationService');
const ReviewService = require('./ReviewService');
const LeaderboardService = require('./LeaderboardService');
const AnalyticsService = require('./AnalyticsService');
const FileUploadService = require('./FileUploadService');
const AdminService = require('./AdminService');

// Export all services
module.exports = {
    AuthService,
    UserService,
    EventService,
    PlayerService,
    HostService,
    MapService,
    NotificationService,
    ReviewService,
    LeaderboardService,
    AnalyticsService,
    FileUploadService,
    AdminService,
};


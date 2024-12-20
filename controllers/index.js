﻿
// index.js
// This file aggregates and exports all Controller files for easy import.

const AuthController = require('./AuthController');
const UserController = require('./UserController');
const EventController = require('./EventController');
const PlayerController = require('./PlayerController');
const HostController = require('./HostController');
const MapController = require('./MapController');
const NotificationController = require('./NotificationController');
const ReviewController = require('./ReviewController');
const LeaderboardController = require('./LeaderboardController');
const AnalyticsController = require('./AnalyticsController');
const FileUploadController = require('./FileUploadController');
const AdminController = require('./AdminController');

// Export all services
module.exports = {
    AuthController,
    UserController,
    EventController,
    PlayerController,
    HostController,
    MapController,
    NotificationController,
    ReviewController,
    LeaderboardController,
    AnalyticsController,
    FileUploadController,
    AdminController
};


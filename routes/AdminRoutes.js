
// AdminRoutes.js
// Handles routes for admin actions such as user management

const express = require('express');
const { AdminController } = require('../controllers');
const { requireAuth, requireRole } = require('../middlewares/AuthMiddleware');
const router = express.Router();

// Route to manage users
// router.put('/users/:userId', AdminController.manageUser);


// Create a new sport
router.post('/sport', requireAuth, requireRole(['admin', 'moderator', 'user']), AdminController.createSport);

// Get all sports
router.get('/sport', AdminController.getAllSports);

// Get a sport by ID
router.get('/sport/:sportId', AdminController.getSportById);

// Update a sport by ID
router.put('/sport/:sportId', requireAuth, requireRole(['admin', 'moderator', 'user']), AdminController.updateSport);

// Delete a sport by ID
router.delete('/sport/:sportId', requireAuth, requireRole(['admin', 'moderator', 'user']), AdminController.deleteSport);

module.exports = router;


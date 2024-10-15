
// UserRoutes.js
// Handles routes for user profile management and preferences

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/AuthMiddleware');
const { UserController } = require('../controllers');

// Protect routes with the middleware RBC details
router.get('/:userId', requireAuth, UserController.getUserById);

// Secure route for updating the profile (allow specific roles)
router.put('/:userId', requireAuth, requireRole(['admin', 'moderator', 'user']), UserController.updateUserProfile);

// Route to deactivate user account (user only)
router.post('/:userId/deactivate', requireAuth, requireRole(['user']), UserController.deactivateUserAccount);

// Route for admin to delete a user account
router.delete('/:userId', requireAuth, requireRole(['admin']), UserController.deleteUserAccount);

// Route to initiate password reset (user or admin)
router.post('/password-reset', UserController.initiatePasswordReset);

// Route to complete password reset (public route)
router.post('/password-reset/complete', UserController.completePasswordReset);

// Route to enable two-factor authentication (user only)
router.post('/:userId/enable-2fa', requireAuth, requireRole(['user']), UserController.enableTwoFactorAuth);

// Route to disable two-factor authentication (user only)
router.post('/:userId/disable-2fa', requireAuth, requireRole(['user']), UserController.disableTwoFactorAuth);

// Route for admin to list all users
router.get('/', requireAuth, requireRole(['user']), UserController.listAllUsers);

module.exports = router;


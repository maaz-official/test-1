// UserController.js
// Handles advanced features like password reset, 2FA, and account deactivation.

const { UserService } = require('../services');
const { ApiError } = require('../utils/api/apiError');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userProfile = await UserService.getUserProfile(userId);
        res.status(200).json(userProfile);
    } catch (error) {
        next(error);
    }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updatedProfile = await UserService.updateUserProfile(userId, req.body, req.user);
        res.status(200).json(updatedProfile);
    } catch (error) {
        next(error);
    }
};

// Update user preferences
exports.updateUserPreferences = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updatedPreferences = await UserService.updateUserPreferences(userId, req.body);
        res.status(200).json(updatedPreferences);
    } catch (error) {
        next(error);
    }
};

// Deactivate user account
exports.deactivateUserAccount = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const deactivatedUser = await UserService.deactivateUserAccount(userId, req.user);
        res.status(200).json({ message: 'Account deactivated successfully', user: deactivatedUser });
    } catch (error) {
        next(error);
    }
};

// Delete user account (admin only)
exports.deleteUserAccount = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await UserService.deleteUserAccount(userId);
        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Initiate password reset
exports.initiatePasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        await UserService.initiatePasswordReset(email);
        res.status(200).json({ message: 'Password reset instructions sent' });
    } catch (error) {
        next(error);
    }
};

// Complete password reset
exports.completePasswordReset = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        await UserService.completePasswordReset(token, newPassword);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

// Enable Two-Factor Authentication
exports.enableTwoFactorAuth = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { method } = req.body; // e.g., 'sms' or 'authenticator'
        const result = await UserService.enableTwoFactorAuth(userId, method);
        res.status(200).json({ message: 'Two-factor authentication enabled', data: result });
    } catch (error) {
        next(error);
    }
};

// Disable Two-Factor Authentication
exports.disableTwoFactorAuth = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await UserService.disableTwoFactorAuth(userId);
        res.status(200).json({ message: 'Two-factor authentication disabled' });
    } catch (error) {
        next(error);
    }
};

// List all users (admin only)
exports.listAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.listAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

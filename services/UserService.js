const { User, UserProfile } = require('../models');
const { ApiError } = require('../utils/api/apiError');
const crypto = require('crypto');
const mongoose = require('mongoose');
const logger = require('../utils/logging/logger');  

// Utility to generate a secure reset token
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    return { resetToken, tokenHash };
};

// Get user profile by ID
exports.getUserProfile = async (userId) => {
    const userProfile = await UserProfile.findOne({ user_id: userId })
        .populate('user_id', 'email username role');
    if (!userProfile) {
        throw new ApiError(404, 'User profile not found');
    }
    return userProfile;
};

// Update user profile by ID
exports.updateUserProfile = async (userId, updateData, currentUser) => {
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
        throw new ApiError(403, 'You are not authorized to update this profile');
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: updateData },
        { new: true }
    );

    if (!updatedProfile) {
        throw new ApiError(404, 'User profile not found');
    }

    logger.info(`Profile for user ${userId} updated by ${currentUser.id}`);
    return updatedProfile;
};

// Update user preferences
exports.updateUserPreferences = async (userId, preferencesData) => {
    const allowedPreferences = ['language_preference', 'privacy_settings'];
    const updateFields = {};

    // Filter valid preferences
    Object.keys(preferencesData).forEach(key => {
        if (allowedPreferences.includes(key)) {
            updateFields[key] = preferencesData[key];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, 'Invalid preferences fields');
    }

    const updatedPreferences = await UserProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: updateFields },
        { new: true }
    );

    if (!updatedPreferences) {
        throw new ApiError(404, 'User profile not found');
    }

    logger.info(`Preferences for user ${userId} updated`);
    return updatedPreferences;
};

// Deactivate user account
exports.deactivateUserAccount = async (userId, currentUser) => {
    if (currentUser.id !== userId) {
        throw new ApiError(403, 'You can only deactivate your own account');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        user.status = 'deactivated';
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`User ${userId} deactivated`);
        return user;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, 'Account deactivation failed');
    }
};

// Delete user account (admin only)
exports.deleteUserAccount = async (userId, currentUser) => {
    if (currentUser.role !== 'admin') {
        throw new ApiError(403, 'Only admins can delete user accounts');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        await User.deleteOne({ _id: userId }).session(session);
        await session.commitTransaction();
        session.endSession();

        logger.info(`User ${userId} deleted by admin ${currentUser.id}`);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, 'Account deletion failed');
    }
};

// Initiate password reset (generates token and sends email)
exports.initiatePasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, 'User with this email does not exist');
    }

    const { resetToken, tokenHash } = generateResetToken();
    user.reset_password_token = tokenHash;
    user.reset_password_expires = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Send reset token to user's email (implement email sending logic)
    // await sendResetEmail(user.email, resetToken);

    logger.info(`Password reset token generated for ${email}`);
};

// Complete password reset
exports.completePasswordReset = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        reset_password_token: hashedToken,
        reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    user.password_hash = newPassword;  // Assume password hashing middleware handles this
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    await user.save();
    logger.info(`Password reset successful for user ${user.email}`);
};

// Enable 2FA
exports.enableTwoFactorAuth = async (userId, method) => {
    const validMethods = ['sms', 'authenticator'];
    if (!validMethods.includes(method)) {
        throw new ApiError(400, 'Invalid 2FA method');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.two_factor_enabled = true;
    user.two_factor_method = method;
    await user.save();

    logger.info(`2FA enabled for user ${userId}`);
    return { twoFactorEnabled: true, method };
};

// Disable 2FA
exports.disableTwoFactorAuth = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.two_factor_enabled = false;
    user.two_factor_method = undefined;
    await user.save();

    logger.info(`2FA disabled for user ${userId}`);
};

// List all users 
exports.listAllUsers = async () => {
    const users = await User.find()
        .select('-password_hash -reset_password_token -reset_password_expires -two_factor_secret -login_attempts -lock_until') 
        .populate({
            path: 'profile',
            select: '-privacy_settings.show_phone_number -address -location -created_by -updated_by -version',
        });

    logger.info(`Listed all users`);
    return users;
};

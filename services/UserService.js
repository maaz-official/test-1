const { User, UserProfile } = require('../models');
const { ApiError } = require('../utils/api/apiError');
const crypto = require('crypto');
const mongoose = require('mongoose');
const logger = require('../utils/logging/logger');  
const redis = require('../utils/cache/redisClient');

// Utility to generate a secure reset token
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    return { resetToken, tokenHash };
};
/**
 * Fetch user and profile details based on user role and self-request.
 * Admins will see more details, regular users will have restricted access to sensitive information.
 * If the user is requesting their own profile, they get full details.
 * @param {Object} currentUser - The current logged-in user (req.user).
 * @param {string} userId - The ID of the user being fetched.
 * @returns {Promise<Object>} - User and profile with selected fields.
 */
exports.getUserById = async (currentUser, userId) => {

    
    // Check if the requesting user is fetching their own profile
    const isSelfRequest = currentUser._id.toString() === userId;

    // Define fields to exclude based on the request type (admin/self vs others)
    let userFieldsToExclude = '-password_hash -reset_password_token -reset_password_expires -two_factor_secret -login_attempts -lock_until';
    let profileFieldsToExclude = '-privacy_settings.show_phone_number -address -created_by -updated_by -version';

    if (!isSelfRequest && currentUser.role !== 'admin') {
        // Limit data for non-admins when accessing other profiles
        userFieldsToExclude += ' -phone_number -status -last_login';
        profileFieldsToExclude += ' -location'; // Hide sensitive fields for others
    }

    // Define the query to fetch the user with populated profile and joined events
    const user = await User.findById(userId)
        .select(userFieldsToExclude) // Exclude sensitive user fields
        .populate({
            path: 'profile', // Populate profile
            select: profileFieldsToExclude, // Exclude sensitive profile fields
        });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    if (!user.profile) {
        throw new ApiError(404, 'User profile not found');
    }
    return user;
};

exports.updateUserProfile = async (currentUser, userId, updateData) => {
    // Check if the current user is trying to update their own profile, or if they are an admin
    const isSelfRequest = currentUser._id.toString() === userId;
    const isAdmin = currentUser.role === 'admin';

    if (!isSelfRequest && !isAdmin) {
        throw new ApiError(403, 'You are not authorized to update this profile');
    }

    // Define fields that regular users can update (non-sensitive fields)
    const userEditableFields = ['phone_number', 'email'];
    const profileEditableFields = ['first_name', 'last_name', 'bio', 'experience_level', 'social_links', 'language_preference', 'privacy_settings'];

    // Admins can update any field except `username` (added rule for no username update)
    const allowedUserFields = isAdmin ? Object.keys(User.schema.paths).filter(field => field !== 'username') : userEditableFields;
    const allowedProfileFields = isAdmin ? Object.keys(UserProfile.schema.paths) : profileEditableFields;

    // Filter the updateData for the fields the user is allowed to update
    const userUpdateData = {};
    const profileUpdateData = {};

    Object.keys(updateData).forEach((field) => {
        if (allowedUserFields.includes(field)) {
            userUpdateData[field] = updateData[field];
        }
        if (allowedProfileFields.includes(field)) {
            profileUpdateData[field] = updateData[field];
        }
    });

    // Check if phone number or email is being updated, and apply additional logic
    let userNeedsUpdate = false;
    if (userUpdateData.phone_number) {
        userUpdateData.status = 'pending'; // Set status to pending if phone is updated
        userNeedsUpdate = true;
    }
    if (userUpdateData.email) {
        userUpdateData.email_verified = false; // Invalidate email verification if email is updated
        userNeedsUpdate = true;
    }

    // Update user and profile in parallel
    const [updatedUser, updatedProfile] = await Promise.all([
        userNeedsUpdate
            ? User.findByIdAndUpdate(userId, { $set: userUpdateData }, { new: true })
            : User.findById(userId).select('-password_hash -reset_password_token -reset_password_expires -two_factor_secret -login_attempts -lock_until'), // If no user fields need update, just fetch the user,
        UserProfile.findOneAndUpdate(
            { user_id: userId },
            { $set: profileUpdateData },
            { new: true }
        ),
    ]);

    if (!updatedUser || !updatedProfile) {
        throw new ApiError(404, 'User or User profile not found');
    }

    // Manually populate profile in the user object (avoiding extra DB calls)
    updatedUser.profile = updatedProfile;

    // logger.info(`User profile for ${userId} updated by ${currentUser._id}`);
    await redis.del(`user:${userId}`);
    return updatedUser;
};


/**
 * Deactivate user account. Only the owner of the account can deactivate it.
 * Clears the cache after deactivation.
 */
exports.deactivateUserAccount = async (userId, currentUser) => {
    if (currentUser._id.toString() !== userId) {
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

        await redisClient.del(`user:${userId}`);

        logger.info(`User ${userId} deactivated`);
        return user;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, 'Account deactivation failed');
    }
};

/**
 * Delete a user and profile. Only admins can delete accounts.
 * Deletes related data and clears the cache after deletion.
 */
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

        await Promise.all([
            User.deleteOne({ _id: userId }).session(session),
            UserProfile.deleteOne({ user_id: userId }).session(session),
        ]);

        await session.commitTransaction();
        session.endSession();

        await redisClient.del(`user:${userId}`);

        logger.info(`User ${userId} deleted by admin ${currentUser.id}`);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, 'Account deletion failed');
    }
};

/**
 * Initiate password reset by generating a token and sending it via email.
 */
exports.initiatePasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, 'User with this email does not exist');
    }

    const { resetToken, tokenHash } = generateResetToken();
    user.reset_password_token = tokenHash;
    user.reset_password_expires = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Implement logic to send reset token via email (out of scope)
    logger.info(`Password reset token generated for ${email}`);

    return { resetToken };
};

/**
 * Complete password reset using the token and a new password.
 */
exports.completePasswordReset = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        reset_password_token: hashedToken,
        reset_password_expires: { $gt: Date.now() },
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

/**
 * Enable Two-Factor Authentication (2FA) for a user.
 */
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

/**
 * Disable Two-Factor Authentication (2FA) for a user.
 */
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
    return users;
};

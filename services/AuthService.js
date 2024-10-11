
// AuthService.js
// This service handles all authentication-related business logic (signup, login, token management).
const User = require('../models/User');
const { generateOtp, sendOtp, verifyOtp, applyOtpRateLimit } = require('../utils/otpService');
const bcrypt = require('bcrypt');
const redis = require('../utils/redisClient'); // Redis client instance
const logger = require('../utils/logger');
const { apiError } = require('../api/apiError'); // Centralized error handling
const { getConfig } = require('../utils/config');
const jwt = require('jsonwebtoken'); // For custom tokens
const crypto = require('crypto');

// OTP and other expiration times from config
const OTP_EXPIRATION = getConfig('OTP_EXPIRATION', 300); // 5 minutes
const USER_TEMP_DATA_EXPIRATION = getConfig('USER_TEMP_DATA_EXPIRATION', 600); // 10 minutes
const ACCOUNT_CREATION_TOKEN_EXPIRATION = getConfig('ACCOUNT_CREATION_TOKEN_EXPIRATION', 1800); // 30 minutes

/**
 * Generate an account creation token.
 * This can be used to resume the account creation flow if it was interrupted.
 * @param {string} phone - Phone number for the account creation.
 * @returns {string} - Generated token.
 */
const generateAccountCreationToken = (phone) => {
    return jwt.sign({ phone }, getConfig('JWT_SECRET'), { expiresIn: ACCOUNT_CREATION_TOKEN_EXPIRATION });
};

/**
 * Service logic for creating an account.
 * Step 1: Initiates account creation by sending OTP and storing account creation token.
 */
exports.createAccount = async ({ email, phone }) => {
    try {
        // Check if the user already exists by email or phone
        let user;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                logger.warn(`Attempt to create account with existing email: ${email}`);
                throw new apiError(400, 'User with this email already exists');
            }
        } else if (phone) {
            user = await User.findOne({ phone_number: phone });
            if (user) {
                logger.warn(`Attempt to create account with existing phone: ${phone}`);
                throw new apiError(400, 'User with this phone number already exists');
            }
        }

        // Apply rate limiting for OTP requests
        if (phone) {
            await applyOtpRateLimit(phone);
        }

        // If phone provided, generate OTP and send it
        if (phone) {
            const otp = generateOtp();
            await sendOtp(phone, otp);

            // Store the phone number in Redis for 10 minutes and generate a token to resume the flow
            const accountCreationToken = generateAccountCreationToken(phone);
            await redis.setex(`createAccount:${phone}`, USER_TEMP_DATA_EXPIRATION, JSON.stringify({ phone }));

            logger.info(`OTP sent for phone number: ${phone}, account creation token generated`);
            return { message: 'OTP sent', phone, token: accountCreationToken };
        }

        // If email provided, proceed to details entry directly
        return { message: 'Account creation initiated', email };

    } catch (error) {
        logger.error(`Error in createAccount: ${error.message}`);
        throw error;
    }
};

/**
 * Service logic for OTP verification.
 * Step 2: Verifies OTP and proceeds to details entry. Supports token-based flow resumption.
 */
exports.verifyOtp = async ({ phone, otp, token }) => {
    try {
        // Validate JWT token to resume flow if present
        if (token) {
            jwt.verify(token, getConfig('JWT_SECRET'));
        }

        const isValid = await verifyOtp(phone, otp);
        if (!isValid) {
            throw new apiError(400, 'Invalid or expired OTP');
        }

        // Store the verified phone number in Redis with a longer expiration to proceed to details entry
        await redis.setex(`verifiedPhone:${phone}`, USER_TEMP_DATA_EXPIRATION, phone);

        logger.info(`OTP verified for phone number: ${phone}`);
        return { message: 'OTP verified', phone };

    } catch (error) {
        logger.error(`OTP verification failed for phone ${phone}: ${error.message}`);
        throw error;
    }
};

/**
 * Service logic for user details entry.
 * Step 3: Enter details after OTP verification. Validates session token if present.
 */
exports.enterDetails = async ({ first_name, last_name, email, phone, token }) => {
    try {
        // Validate JWT token if flow is resumed
        if (token) {
            jwt.verify(token, getConfig('JWT_SECRET'));
        }

        // Validation logic for required fields
        if (!first_name || !last_name || !email || !phone) {
            throw new apiError(400, 'All fields are required');
        }

        // Check if the phone was previously verified
        const verifiedPhone = await redis.get(`verifiedPhone:${phone}`);
        if (!verifiedPhone) {
            throw new apiError(400, 'Phone number not verified');
        }

        // Store user details temporarily in Redis before finalizing the account
        await redis.setex(`userDetails:${phone}`, USER_TEMP_DATA_EXPIRATION, JSON.stringify({ first_name, last_name, email, phone }));

        logger.info(`User details accepted for phone: ${phone}`);
        return { message: 'Details accepted', email, phone };

    } catch (error) {
        logger.error(`Error in enterDetails for phone ${phone}: ${error.message}`);
        throw error;
    }
};

/**
 * Service logic for setting password.
 * Step 4: Set the password and finalize the account creation. Atomic transaction for user creation.
 */
exports.setPassword = async ({ phone, password, confirmPassword, token }) => {
    try {
        // Validate JWT token if flow is resumed
        if (token) {
            jwt.verify(token, getConfig('JWT_SECRET'));
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            throw new apiError(400, 'Passwords do not match');
        }

        // Retrieve user details from Redis
        const userDetails = await redis.get(`userDetails:${phone}`);
        if (!userDetails) {
            throw new apiError(400, 'User details not found or expired');
        }

        const { first_name, last_name, email } = JSON.parse(userDetails);

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start an atomic transaction to ensure that user creation is successful
        const session = await User.startSession();
        session.startTransaction();

        try {
            // Create the user in the database
            const user = new User({
                first_name,
                last_name,
                email,
                phone_number: phone,
                password_hash: hashedPassword
            });

            await user.save({ session });

            // Clean up Redis entries after successful creation
            await redis.del(`createAccount:${phone}`);
            await redis.del(`verifiedPhone:${phone}`);
            await redis.del(`userDetails:${phone}`);

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            logger.info(`User created successfully for phone: ${phone}`);
            return { message: 'Account created successfully', user };

        } catch (transactionError) {
            // Rollback the transaction in case of failure
            await session.abortTransaction();
            session.endSession();
            logger.error(`Transaction failed during user creation for phone ${phone}: ${transactionError.message}`);
            throw new apiError(500, 'User creation failed, please try again later');
        }

    } catch (error) {
        logger.error(`Error in setPassword for phone ${phone}: ${error.message}`);
        throw error;
    }
};

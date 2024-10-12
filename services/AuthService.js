const { User, OtpVerification, UserProfile } = require('../models');
const { ApiError } = require('../utils/api/apiError');
const { sendOtp } = require('../utils/auth/otpService');
const { getConfig } = require('../utils/helpers/config');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { generateUsername } = require('../utils/helpers/helperFunctions');

// JWT expiration time for account creation token
const ACCOUNT_CREATION_TOKEN_EXPIRATION = getConfig('ACCOUNT_CREATION_TOKEN_EXPIRATION', 1800); // 30 minutes
const OTP_EXPIRATION= getConfig('OTP_EXPIRATION', 300);

// Generate JWT token for account creation flow resumption
const generateAccountCreationToken = (phone) => {
    return jwt.sign({ phone }, getConfig('JWT_SECRET'), { expiresIn: ACCOUNT_CREATION_TOKEN_EXPIRATION });
};

exports.createAccount = async ({ phone }) => {
    if (!phone) {
        throw new ApiError(400, 'Phone number is required');
    }

    // Check if phone number is already registered
    const user = await User.findOne({ phone_number: phone });
    if (user) {
        throw new ApiError(400, 'User with this phone number already exists');
    }

    // Generate OTP and store it in MongoDB
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    console.log("🚀 ~ exports.createAccount= ~ otp:", otp)
    await OtpVerification.findOneAndUpdate(
        { phone },
        { otp, createdAt: Date.now(), expiresAt: new Date(Date.now() + OTP_EXPIRATION * 1000) },
        { upsert: true }
    );

    // Send OTP via SMS (ensure the sendOtp function is implemented properly)
    // await sendOtp(phone, otp);

    // Generate JWT token to resume the account creation flow
    const accountCreationToken = generateAccountCreationToken(phone);

    return {
        message: 'OTP sent to phone',
        token: accountCreationToken, // This will be stored in HTTP-only cookies
    };
};

/**
 * Service logic for OTP verification.
 * Step 2: Verifies OTP and proceeds to details entry. Supports token-based flow resumption.
 */
exports.verifyOtp = async ({ phone, otp }) => {
    // Retrieve OTP from MongoDB
    const otpRecord = await OtpVerification.findOne({ phone });
    if (!otpRecord || otpRecord.otp !== otp || new Date() > otpRecord.expiresAt) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Clean up the OTP record after successful verification
    await OtpVerification.deleteOne({ phone });

    // Generate a temporary token for the next step (JWT)
    const token = jwt.sign({ phone_verified: true, phone }, getConfig('JWT_SECRET'), {
        expiresIn: ACCOUNT_CREATION_TOKEN_EXPIRATION
    });

    return { message: 'Phone number verified', token };
};

/**
 * Service logic for user details entry.
 * Step 3: Enter details after OTP verification. Validates session token if present.
 */
exports.enterDetails = async ({ first_name, last_name, email, password, confirmPassword, phone }) => {
    // Validate user details
    if (!first_name || !last_name || !password || !confirmPassword || !password) {
        throw new ApiError(400, 'All fields are required');
    }
    if (password !== confirmPassword) {
        throw new ApiError(400, 'Passwords do not match');
    }

    // Check if the user already exists (by email)
    if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new ApiError(400, 'User with this email already exists');
    }

    // Generate a unique username from first and last name
    const username = await generateUsername(first_name, last_name);

    // Use a session to ensure atomic creation of both User and UserProfile
    const session = await User.startSession();
    session.startTransaction();

    try {
        // Create a new user with the provided details
        const user = new User({
            email,
            phone_number: phone,
            username,  
            password_hash: password,
            status: 'active',
            role: 'user'
        });

        // Save the user
        await user.save({ session });

        // Create a corresponding user profile (with default or empty fields)
        const userProfile = new UserProfile({
            user_id: user._id, // Link to the User
            first_name: first_name,
            last_name: last_name,
            experience_level: 'beginner'
        });

        // Save the user profile
        await userProfile.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return { message: 'Account and profile created successfully', user };

    } catch (error) {
        // Rollback if there's an error
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

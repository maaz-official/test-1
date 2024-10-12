const { generateOtp, sendOtp, verifyOtp, applyOtpRateLimit } = require('../utils/auth/otpService');
const argon2 = require('argon2');
const redis = require('../utils/cache/redisClient');
const logger = require('../utils/logging/logger');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ApiError } = require('../utils/api/apiError');
const { getConfig } = require('../utils/helpers/config');
const { User } = require('../models');
const { sendEmail } = require('../utils/mail/mailer');

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
const generateAccountCreationToken = (otpTarget) => {
    return jwt.sign({ otpTarget }, getConfig('JWT_SECRET'), { expiresIn: ACCOUNT_CREATION_TOKEN_EXPIRATION });
};

/**
 * Service logic for creating an account.
 * Step 1: Initiates account creation by sending OTP and storing account creation token.
 */
exports.createAccount = async ({ email, phone }) => {
    try {
        if (!email && !phone) {
            throw new ApiError(400, 'Either email or phone must be provided');
        }
        if (email && phone) {
            throw new ApiError(400, 'Only one of email or phone must be provided, not both');
        }
        let user;
        // Query if email is provided
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                logger.warn(`Attempt to create account with existing email: ${email}`);
                throw new ApiError(400, 'User with this email already exists');
            }
        }

        // Query if phone is provided
        if (phone) {
            user = await User.findOne({ phone_number: phone });
            if (user) {
                logger.warn(`Attempt to create account with existing phone: ${phone}`);
                throw new ApiError(400, 'User with this phone number already exists');
            }
        }

        // Apply rate limiting for OTP requests
        const otpTarget = phone || email;
        await applyOtpRateLimit(otpTarget);

        // Send OTP
        const otp = generateOtp();
        console.log("🚀 ~ OTP:", otp);
        if (phone) {
            // await sendOtp(phone, otp); // Implement OTP sending for phone
        } else if (email) {
            await sendEmail({
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP code is: ${otp}`,
                html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
            });
        }

        await redis.setex(`otp:${otpTarget}`, OTP_EXPIRATION, otp);

        return { message: 'OTP sent', otpTarget };

    } catch (error) {
        logger.error(`Error in requestOtp: ${error.message}`);
        throw error;
    }
};


/**
 * Service logic for OTP verification.
 * Step 2: Verifies OTP and proceeds to details entry. Supports token-based flow resumption.
 */
exports.verifyOtp = async ({ otpTarget, otp }) => {
    try {
        // Step 1: Retrieve the stored OTP from Redis and compare with the provided OTP
        const storedOtp = await redis.get(`otp:${otpTarget}`);
        if (!storedOtp || storedOtp !== otp) {
            throw new ApiError(400, 'Invalid or expired OTP');
        }
        console.log("🚀 ~ exports.verifyOtp= ~ otpTarget:", otpTarget)

        // Step 2: OTP is valid, generate the account creation token
        const accountCreationToken = jwt.sign({ otpTarget }, getConfig('JWT_SECRET'), {
            expiresIn: ACCOUNT_CREATION_TOKEN_EXPIRATION,
        });

        // Step 3: Store the verified otpTarget (email/phone) in Redis for further steps
        await redis.setex(`verified:${otpTarget}`, USER_TEMP_DATA_EXPIRATION, otpTarget);

        // Log success and return success message (no token in body)
        logger.info(`OTP verified for ${otpTarget}`);
        return { message: 'OTP verified', otpTarget, token: accountCreationToken };

    } catch (error) {
        logger.error(`OTP verification failed for ${otpTarget}: ${error.message}`);
        throw error;
    }
};


/**
 * Service logic for user details entry.
 * Step 3: Enter details after OTP verification. Validates session token if present.
 */
exports.enterDetails = async ({ first_name, last_name, email, phone, token }) => {
    try {
        // Step 1: Validate the JWT token if flow is resumed
        if (token) {
            jwt.verify(token, getConfig('JWT_SECRET'));
        }

        // Step 2: Ensure one of the data (email or phone) was already verified
        const verifiedPhone = phone ? await redis.get(`verified:${phone}`) : null;
        const verifiedEmail = email ? await redis.get(`verified:${email}`) : null;

        // If neither phone nor email is verified, throw an error
        if (!verifiedPhone && !verifiedEmail) {
            throw new ApiError(400, 'Phone or email must be verified first');
        }

        // Step 3: If the provided email is not verified, send OTP for verification
        if (!verifiedEmail && email) {
            const otp = generateOtp();
            console.log("🚀 ~ sendEmail= ~ otp:", otp)
            // await sendEmail({
            //     to: email,
            //     subject: 'Your OTP Code',
            //     text: `Your OTP code is: ${otp}`,
            //     html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
            // }); 
            logger.info(`OTP sent to email: ${email} for verification`);
            return { message: 'OTP sent to email for verification', email };
        }

        // Step 4: If the provided phone is not verified, send OTP for verification
        if (!verifiedPhone && phone) {
            const otp = generateOtp();
            await sendOtp(phone, otp);  
            logger.info(`OTP sent to phone: ${phone} for verification`);
            return { message: 'OTP sent to phone for verification', phone };
        }

        // Step 5: Store user details temporarily in Redis before finalizing the account
        const otpTarget = phone || email;
        await redis.setex(`userDetails:${otpTarget}`, USER_TEMP_DATA_EXPIRATION, JSON.stringify({ first_name, last_name, email, phone }));

        logger.info(`User details accepted for ${otpTarget}`);
        return { message: 'Details accepted', email, phone };

    } catch (error) {
        logger.error(`Error in enterDetails: ${error.message}`);
        throw error;
    }
};


/**
 * Service logic for setting password.
 * Step 4: Set the password and finalize the account creation. Atomic transaction for user creation.
 */
exports.setPassword = async ({ otpTarget, password, confirmPassword, token }) => {
    try {
        // Validate JWT token if flow is resumed
        if (token) {
            jwt.verify(token, getConfig('JWT_SECRET'));
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            throw new ApiError(400, 'Passwords do not match');
        }

        // Retrieve user details from Redis
        const userDetails = await redis.get(`userDetails:${otpTarget}`);
        if (!userDetails) {
            throw new ApiError(400, 'User details not found or expired');
        }

        const { first_name, last_name, email, phone } = JSON.parse(userDetails);

        // Hash the password with Argon2
        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

        // Atomic transaction to ensure that user creation is successful
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
            await redis.del(`createAccount:${otpTarget}`);
            await redis.del(`verified:${otpTarget}`);
            await redis.del(`userDetails:${otpTarget}`);

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            logger.info(`User created successfully for ${otpTarget}`);
            return { message: 'Account created successfully', user };

        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            logger.error(`Transaction failed: ${transactionError.message}`);
            throw new ApiError(500, 'User creation failed, please try again later');
        }

    } catch (error) {
        logger.error(`Error in setPassword for ${otpTarget}: ${error.message}`);
        throw error;
    }
};


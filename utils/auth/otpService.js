const crypto = require('crypto');
const redis = require('./redisClient'); // Redis client instance
const twilio = require('twilio');
const { getConfig } = require('./config'); // Get configurations
const logger = require('./logger'); // Custom logger for error reporting

// Twilio client (replace with your Twilio credentials)
const twilioClient = twilio(getConfig('TWILIO_SID'), getConfig('TWILIO_AUTH_TOKEN'));

// OTP configuration from environment variables
const OTP_LENGTH = getConfig('OTP_LENGTH', 6);
const OTP_EXPIRATION = getConfig('OTP_EXPIRATION', 300); // 5 minutes in seconds
const OTP_RESEND_INTERVAL = getConfig('OTP_RESEND_INTERVAL', 60); // 1 minute in seconds
const OTP_RATE_LIMIT = getConfig('OTP_RATE_LIMIT', 5); // Max OTP requests per 5 minutes

/**
 * Encrypts the OTP using AES-256-CBC.
 * @param {string} otp - The OTP to encrypt.
 * @returns {string} - The encrypted OTP.
 */
const encryptOtp = (otp) => {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(getConfig('ENCRYPTION_KEY')), iv);
    let encrypted = cipher.update(otp);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypts the encrypted OTP.
 * @param {string} encryptedOtp - The encrypted OTP to decrypt.
 * @returns {string} - The decrypted OTP.
 */
const decryptOtp = (encryptedOtp) => {
    const [ivHex, encryptedText] = encryptedOtp.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(getConfig('ENCRYPTION_KEY')), iv);
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

/**
 * Generate a random OTP of a specific length.
 * @param {number} length - Length of the OTP.
 * @returns {string} - Generated OTP.
 */
const generateOtp = (length = OTP_LENGTH) => {
    return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
};

/**
 * Send OTP to the provided phone number using Twilio.
 * @param {string} phone - The phone number to send OTP to.
 * @param {string} otp - The OTP code to send.
 */
const sendOtp = async (phone, otp) => {
    try {
        // Send the OTP via Twilio SMS
        await twilioClient.messages.create({
            body: `Your verification code is ${otp}`,
            from: getConfig('TWILIO_PHONE_NUMBER'),
            to: phone,
        });

        logger.info(`OTP sent to phone number ${phone}`);

        // Encrypt and store OTP in Redis with expiration time
        const encryptedOtp = encryptOtp(otp);
        await redis.setex(`otp:${phone}`, OTP_EXPIRATION, encryptedOtp);

        // Store last OTP request time to prevent abuse (rate limiting)
        await redis.set(`otp:rate_limit:${phone}`, Date.now(), 'EX', OTP_RESEND_INTERVAL);

        return { message: 'OTP sent successfully', phone };
    } catch (error) {
        logger.error(`Error sending OTP to ${phone}: ${error.message}`);
        throw new Error('Failed to send OTP');
    }
};

/**
 * Verify the OTP for the given phone number.
 * @param {string} phone - The phone number associated with the OTP.
 * @param {string} otp - The OTP code to verify.
 * @returns {boolean} - Returns true if OTP is valid, otherwise throws an error.
 */
const verifyOtp = async (phone, otp) => {
    try {
        // Get the encrypted OTP from Redis
        const encryptedOtp = await redis.get(`otp:${phone}`);
        if (!encryptedOtp) {
            throw new Error('OTP not found or expired');
        }

        // Decrypt and verify OTP
        const storedOtp = decryptOtp(encryptedOtp);
        if (storedOtp !== otp) {
            throw new Error('Invalid OTP');
        }

        // OTP verified, delete from Redis to prevent reuse
        await redis.del(`otp:${phone}`);
        logger.info(`OTP verified for phone number ${phone}`);

        return true;
    } catch (error) {
        logger.error(`OTP verification failed for ${phone}: ${error.message}`);
        throw new Error('OTP verification failed');
    }
};

/**
 * Resend the OTP if allowed (based on rate limiting).
 * @param {string} phone - The phone number to resend OTP to.
 */
const resendOtp = async (phone) => {
    try {
        // Check if OTP was requested recently (rate limiting)
        const lastRequest = await redis.get(`otp:rate_limit:${phone}`);
        if (lastRequest && Date.now() - lastRequest < OTP_RESEND_INTERVAL * 1000) {
            throw new Error(`OTP was recently sent. Please wait ${OTP_RESEND_INTERVAL / 60} minutes.`);
        }

        // Generate a new OTP and send it
        const otp = generateOtp();
        await sendOtp(phone, otp);
        return { message: 'OTP resent successfully', phone };
    } catch (error) {
        logger.error(`Error resending OTP to ${phone}: ${error.message}`);
        throw new Error('Failed to resend OTP');
    }
};

/**
 * Apply rate limiting for OTP requests to prevent abuse.
 * @param {string} phone - The phone number making the OTP request.
 * @throws {Error} - Throws an error if rate limit exceeded.
 */
const applyOtpRateLimit = async (phone) => {
    const requests = await redis.incr(`otp:requests:${phone}`);
    if (requests === 1) {
        // Set expiration for the rate limit counter (5 minutes)
        await redis.expire(`otp:requests:${phone}`, 300);
    }
    if (requests > OTP_RATE_LIMIT) {
        throw new Error('Too many OTP requests. Please try again later.');
    }
};

module.exports = {
    generateOtp,
    sendOtp,
    verifyOtp,
    resendOtp,
    applyOtpRateLimit,
};

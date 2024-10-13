// AuthController.js
// This controller handles user authentication (login, signup, logout) and manages JWT tokens.

const { AuthService } = require("../services");
const { getConfig } = require("../utils/helpers/config");
const jwt = require('jsonwebtoken');

const ACCOUNT_CREATION_TOKEN_EXPIRATION = getConfig('ACCOUNT_CREATION_TOKEN_EXPIRATION', 1800); // 30 minutes

// Create account - Step 1 (phone input)
exports.createAccount = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Call AuthService to initiate account creation by sending OTP
        const result = await AuthService.createAccount({ phone });

        // Set token as an HTTP-only cookie
        res.cookie('accountCreationToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set 'true' for production
            sameSite: 'Strict',
            maxAge: ACCOUNT_CREATION_TOKEN_EXPIRATION * 1000, // 30 minutes
        });

        // Respond with a success message
        res.status(200).json({ message: 'OTP sent to phone' });
    } catch (error) {
        next(error);
    }
};

// OTP verification - Step 2
exports.verifyOtp = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone and OTP are required' });
        }

        // Call AuthService to verify OTP and return token if successful
        const result = await AuthService.verifyOtp({ phone, otp });

        // Set the verified token in the HTTP-only cookie for further steps
        res.cookie('accountCreationToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: ACCOUNT_CREATION_TOKEN_EXPIRATION * 1000, // 30 minutes
        });

        // Respond with success message
        res.status(200).json({ message: 'Phone number verified' });
    } catch (error) {
        next(error);
    }
};

// Enter user details - Step 3
exports.enterDetails = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, confirmPassword } = req.body;
        console.log("🚀 ~ exports.enterDetails= ~ req.body:", req.body)

        // Get the account creation token from the cookies
        const token = req.cookies.accountCreationToken;

        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        // Decode the JWT token to extract the phone number
        const { phone } = jwt.verify(token, getConfig('JWT_SECRET'));
        console.log("🚀 ~ exports.enterDetails= ~ phone:", phone)

        // Call AuthService to complete the account creation process with provided details
        const result = await AuthService.enterDetails({
            first_name,
            last_name,
            email,
            password,
            confirmPassword,
            phone
        });

        // Respond with success message and created user details
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


// Login - allows login with email or phone
exports.login = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;

        // Call AuthService to handle login
        const { token, user } = await AuthService.login({ email, phone, password });

        // Set token in HTTP-only cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: ACCOUNT_CREATION_TOKEN_EXPIRATION * 10000, // 30 minutes
        });

        // Respond with success
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        next(error);
    }
};

// Logout - clears JWT cookie
exports.logout = async (req, res, next) => {
    try {
        // Clear the auth token cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
};
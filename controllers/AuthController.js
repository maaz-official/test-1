// AuthController.js
// This controller handles user authentication (login, signup, logout) and manages JWT tokens.

const AuthService = require('../services/AuthService');

// Create account - Step 1 (email/phone input)
exports.createAccount = async (req, res, next) => {
    const { email, phone } = req.body;
    try {
        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone number is required' });
        }
        const result = await AuthService.createAccount({ email, phone });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


// OTP verification - Step 2
exports.verifyOtp = async (req, res, next) => {
    const { phone, otp } = req.body;
    try {
        const result = await AuthService.verifyOtp({ phone, otp });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


// Enter user details - Step 3
exports.enterDetails = async (req, res, next) => {
    const { first_name, last_name, email, phone } = req.body;
    try {
        const result = await AuthService.enterDetails({ first_name, last_name, email, phone });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


// Password setup - Step 4
exports.setPassword = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    try {
        const result = await AuthService.setPassword({ email, password, confirmPassword });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

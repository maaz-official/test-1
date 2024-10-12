// AuthController.js
// This controller handles user authentication (login, signup, logout) and manages JWT tokens.

const { AuthService } = require("../services");
const { getConfig } = require("../utils/helpers/config");
const { parseCookies } = require("../utils/helpers/helperFunctions");

const ACCOUNT_CREATION_TOKEN_EXPIRATION = getConfig('ACCOUNT_CREATION_TOKEN_EXPIRATION', 1000); //30 minutes

// Create account - Step 1 (email/phone input)
exports.createAccount = async (req, res, next) => {
    try {
        
        const result = await AuthService.createAccount(req.body); 
        res.status(200).json(result);
    } catch (error) {
        next(error); 
    }
};


// OTP verification - Step 2
exports.verifyOtp = async (req, res, next) => {
    const { otpTarget, otp } = req.body;

    try {
        // Call the service to verify OTP and generate the token
        const { message, otpTarget: verifiedTarget, token } = await AuthService.verifyOtp({ otpTarget, otp });

        // Set the JWT token in a secure, HttpOnly cookie
        res.cookie('accountCreationToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: ACCOUNT_CREATION_TOKEN_EXPIRATION * 1000,
        });

        res.status(200).json({ message: 'OTP verified', otpTarget: verifiedTarget });

    } catch (error) {
        next(error); 
    }
}


// Enter user details - Step 3
exports.enterDetails = async (req, res, next) => {
    const { first_name, last_name, email, phone } = req.body;
    const token = req.cookies ? req.cookies.accountCreationToken : null;
    
    if (!token) {
        console.error("Missing token in cookies:", req.cookies);
        return res.status(401).json({ message: 'Authorization token is missing from cookies.' });
    }
    if (!first_name || !last_name) {
        return res.status(400).json({ message: 'First name and last name are required.' });
    }

    if (!email || !phone) {
        return res.status(400).json({ message: 'Both email and phone is required.' });
    }

    try {
        const result = await AuthService.enterDetails({ first_name, last_name, email, phone, token });
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
        throw error;
    }
};

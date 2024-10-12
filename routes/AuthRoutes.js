
// AuthRoutes.js
// Handles routes for user authentication (login, signup, logout)

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Step 1: Create account (email/phone)
router.post('/create-account', AuthController.createAccount);

// Step 2: Verify OTP
router.post('/verify-otp', AuthController.verifyOtp);

// Step 3: Enter user details
router.post('/enter-details', AuthController.enterDetails);

// Step 4: Set password
router.post('/set-password', AuthController.setPassword);



// // Route to handle user login
// router.post('/login', AuthController.login);

// // Route to handle user logout
// router.post('/logout', AuthController.logout);

module.exports = router;


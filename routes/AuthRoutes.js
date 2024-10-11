
// AuthRoutes.js
// Handles routes for user authentication (login, signup, logout)

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Route to handle user login
router.post('/login', AuthController.login);

// Route to handle user signup
router.post('/signup', AuthController.signup);

// Route to handle user logout
router.post('/logout', AuthController.logout);

module.exports = router;


// backend/routes/auth.js

const express = require('express');
const router = express.Router();

// Import all required functions from the controller
const { 
    registerUser, 
    loginUser, 
    updateProfile, 
    updatePassword 
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

// Public Routes
// POST /auth/register
router.post('/register', registerUser);

// POST /auth/login
router.post('/login', loginUser);

// Protected Routes (require JWT)
// PUT /auth/update-profile
router.put('/update-profile', protect, updateProfile);

// PUT /auth/update-password
router.put('/update-password', protect, updatePassword);

module.exports = router;
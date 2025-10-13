// backend/routes/course.js

const express = require('express');
const router = express.Router();

// Import necessary middlewares
const { protect } = require('../middlewares/authMiddleware');

// Import Controller functions
const { 
    listPublicCourses, 
    checkEnrollmentStatus,
    getCourseDetails,
} = require('../controllers/courseController'); 

// -----------------------------------------------------------------
// 📚 Public Course Routes
// -----------------------------------------------------------------

// GET /courses 
// Route: List all available courses (for the homepage/catalog). No authentication required.
router.get('/', listPublicCourses);

// GET /courses/:id
// Route: Get course details. This route uses the 'protect' middleware to identify the user
// (if logged in), and then uses 'checkEnrollmentStatus' to determine what data to return.
// The 'protect' middleware is optional here (if user is not logged in, req.user will be null, 
// which is handled by checkEnrollmentStatus).
router.get('/:id', protect, checkEnrollmentStatus, getCourseDetails);


module.exports = router;
// backend/routes/admin.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// Import ALL necessary functions from the Admin Controller
const { 
    addStudent, 
    updateStudent, 
    listAllStudents,
    getPaymentsReport, // Placeholder report route

    // Course Management
    addCourse, 
    updateCourse, 
    listAllCourses,
    deleteCourse, // Note: getCourseDetails was removed from the controller exports, so we omit it here.
    
    // Lesson Management
    addLesson,
    updateLesson,
    getLessonsByCourse,
    deleteLesson
} = require('../controllers/adminController'); 


// -----------------------------------------------------------------
// 👤 Student Management Routes (Requires Admin privileges)
// -----------------------------------------------------------------

// POST /admin/student — Add Student
router.post('/student', protect, admin, addStudent);

// PUT /admin/student/:id — Update Student
router.put('/student/:id', protect, admin, updateStudent);

// GET /admin/students — View all students
router.get('/students', protect, admin, listAllStudents);


// -----------------------------------------------------------------
// 📚 Course Management Routes (Requires Admin privileges)
// -----------------------------------------------------------------

// POST /admin/course — Add Course
router.post('/course', protect, admin, addCourse);

// PUT /admin/course/:id — Update Course
router.put('/course/:id', protect, admin, updateCourse);

// GET /admin/courses — List All Courses
router.get('/courses', protect, admin, listAllCourses);

// DELETE /admin/course/:id — Delete Course
router.delete('/course/:id', protect, admin, deleteCourse);


// -----------------------------------------------------------------
// 🎬 Lesson Management Routes (Requires Admin privileges)
// -----------------------------------------------------------------

// POST /admin/lesson — Add Lesson
router.post('/lesson', protect, admin, addLesson);

// PUT /admin/lesson/:id — Update a specific Lesson
router.put('/lesson/:id', protect, admin, updateLesson);

// GET /admin/lessons/:courseId — View Lessons by Course
router.get('/lessons/:courseId', protect, admin, getLessonsByCourse);

// DELETE /admin/lesson/:id — Delete a specific Lesson
router.delete('/lesson/:id', protect, admin, deleteLesson);


// -----------------------------------------------------------------
// 💳 Payments/Transactions Routes
// -----------------------------------------------------------------

// GET /admin/payments — Payment and Order Reports
router.get('/payments', protect, admin, getPaymentsReport);


module.exports = router;
// backend/controllers/courseController.js

const db = require('../config/db');

// @desc    List all available courses for public viewing
// @route   GET /courses
// @access  Public
const listPublicCourses = async (req, res) => {
    // Only fetch essential course details
    const sql = `
        SELECT id, title, description, price, image_url, category 
        FROM courses 
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, courses) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not retrieve public courses.' });
        }
        res.status(200).json({ 
            message: 'Available courses retrieved successfully.',
            courses: courses 
        });
    });
};

// Middleware to check if a student is enrolled in a course
// Runs before getCourseDetails
const checkEnrollmentStatus = async (req, res, next) => {
    const { id: courseId } = req.params;
    const { user } = req; // User object attached by the protect middleware

    // If the user is an Admin, they can view any course details immediately
    if (user && user.role === 'admin') {
        req.isEnrolled = true;
        return next();
    }
    
    // If user is not logged in, they can only see course metadata (handled in the controller)
    if (!user) {
        req.isEnrolled = false;
        return next();
    }

    // Check enrollment for logged-in student
    const sql = `
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ?
    `;
    
    db.get(sql, [user.id, courseId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error during enrollment check.' });
        }
        
        // Attach enrollment status to the request
        req.isEnrolled = !!row;
        next();
    });
};

// @desc    Get course details and lessons (lessons are restricted by enrollment)
// @route   GET /courses/:id
// @access  Public (Metadata) / Private (Lessons)
const getCourseDetails = async (req, res) => {
    const { id: courseId } = req.params;
    const isEnrolled = req.isEnrolled;
    const userId = req.user ? req.user.id : null;

    // 1. Get Course Metadata
    const courseSql = `
        SELECT id, title, description, price, image_url, category 
        FROM courses 
        WHERE id = ?
    `;

    db.get(courseSql, [courseId], async (err, course) => {
        if (err) return res.status(500).json({ message: 'Database error fetching course.' });
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        let lessons = [];
        let progress = {};

        // 2. If Enrolled (or Admin), fetch Lessons and Progress
        if (isEnrolled) {
            const lessonsSql = `
                SELECT id, title, video_url, notes, order_number 
                FROM lessons 
                WHERE course_id = ? 
                ORDER BY order_number ASC
            `;
            
            lessons = await new Promise((resolve, reject) => {
                db.all(lessonsSql, [courseId], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            // 3. Fetch Progress (Only for logged-in students)
            if (userId) {
                const progressSql = `
                    SELECT lesson_id 
                    FROM progress 
                    WHERE user_id = ? AND course_id = ?
                `;
                
                const progressRows = await new Promise((resolve, reject) => {
                    db.all(progressSql, [userId, courseId], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    });
                });
                
                // Format progress into an object for easy lookup
                progress = progressRows.reduce((acc, row) => {
                    acc[row.lesson_id] = true;
                    return acc;
                }, {});
            }
        }
        
        // 4. Return Data
        const responseData = {
            ...course,
            isEnrolled: isEnrolled,
            lessons: isEnrolled ? lessons.map(lesson => ({
                ...lesson,
                isCompleted: !!progress[lesson.id]
            })) : [],
            // If not enrolled, lessons array is empty.
            message: isEnrolled 
                ? 'Course details and lessons retrieved.' 
                : 'Course details retrieved. Login and purchase to access lessons.'
        };

        res.status(200).json(responseData);
    });
};


module.exports = {
    listPublicCourses,
    checkEnrollmentStatus,
    getCourseDetails,
};
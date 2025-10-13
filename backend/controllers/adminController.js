// backend/controllers/adminController.js

const db = require('../config/db');
// IMPORTANT: Ensure you have access to hashPassword from your utilities
const { hashPassword } = require('../utils/hash'); 


// -----------------------------------------------------------------
// 👤 STUDENT MANAGEMENT (Admin CRUD)
// -----------------------------------------------------------------

// @desc    Admin adds a new student user
// @route   POST /admin/student
// @access  Private/Admin
const addStudent = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    try {
        // 1. Check if user already exists
        db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
            if (row) return res.status(400).json({ message: 'User with that email already exists.' });

            // 2. Hash Password
            const hashedPassword = await hashPassword(password);
            const role = 'student'; 

            // 3. Insert new student
            db.run(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role],
                function (insertErr) {
                    if (insertErr) return res.status(500).json({ message: 'Failed to add student.', error: insertErr.message });
                    
                    res.status(201).json({ 
                        message: 'Student account created successfully.', 
                        userId: this.lastID,
                        name, email
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during student creation.', error: error.message });
    }
};

// @desc    Admin updates student details (excluding password)
// @route   PUT /admin/student/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body; 

    if (!name && !email) {
        return res.status(400).json({ message: 'Provide a new name or email to update.' });
    }

    let fields = [];
    let values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    
    values.push(id); // ID for the WHERE clause

    const sql = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = ? AND role = 'student'
    `;

    db.run(sql, values, function(err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Email already in use by another student.' });
            }
            return res.status(500).json({ message: 'Database error: Could not update student.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: `Student with ID ${id} not found.` });
        }

        res.status(200).json({ 
            message: `Student ID ${id} updated successfully.`,
            changes: this.changes
        });
    });
};

// @desc    Admin lists all student users
// @route   GET /admin/students
// @access  Private/Admin
const listAllStudents = async (req, res) => {
    // Select all fields except the password hash
    const sql = `SELECT id, name, email, role, created_at, updated_at FROM users WHERE role = 'student'`;

    db.all(sql, [], (err, students) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not retrieve students.' });
        }
        
        res.status(200).json({ 
            message: 'All student accounts retrieved successfully.',
            count: students.length,
            students: students 
        });
    });
};


// -----------------------------------------------------------------
// 💳 PAYMENTS / REPORTS (Placeholder)
// -----------------------------------------------------------------

const getPaymentsReport = (req, res) => {
    // This will eventually query the 'orders' table
    res.status(501).json({ message: 'Payments Report not yet implemented.' });
};


// -----------------------------------------------------------------
// 📚 COURSE MANAGEMENT
// -----------------------------------------------------------------

const addCourse = async (req, res) => {
    const { title, description, price, image_url, category } = req.body;

    if (!title || !description || !price || !category) {
        return res.status(400).json({ message: 'Please provide title, description, price, and category.' });
    }

    const sql = `
        INSERT INTO courses (title, description, price, image_url, category) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [title, description, price, image_url, category], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not add course.', error: err.message });
        }
        
        res.status(201).json({ 
            message: 'Course added successfully.', 
            courseId: this.lastID 
        });
    });
};

const listAllCourses = async (req, res) => {
    const sql = `SELECT * FROM courses ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not retrieve courses.', error: err.message });
        }
        
        res.status(200).json({ 
            message: 'Courses retrieved successfully.',
            count: rows.length,
            courses: rows 
        });
    });
};

const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, image_url, category } = req.body;
    
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    let fields = [];
    let values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }
    if (category !== undefined) { fields.push('category = ?'); values.push(category); }
    
    values.push(id); 

    const sql = `
        UPDATE courses 
        SET ${fields.join(', ')} 
        WHERE id = ?
    `;

    db.run(sql, values, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not update course.', error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: `Course with ID ${id} not found.` });
        }

        res.status(200).json({ 
            message: `Course ID ${id} updated successfully.`,
            changes: this.changes
        });
    });
};

const deleteCourse = async (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM courses WHERE id = ?`;

    db.run(sql, id, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not delete course.', error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: `Course with ID ${id} not found.` });
        }

        res.status(200).json({ 
            message: `Course ID ${id} and associated lessons deleted successfully.`,
            changes: this.changes
        });
    });
};


// -----------------------------------------------------------------
// 🎬 LESSON MANAGEMENT
// -----------------------------------------------------------------

const addLesson = async (req, res) => {
    const { course_id, title, video_url, notes, order_number } = req.body;

    if (!course_id || !title || !video_url || order_number === undefined) {
        return res.status(400).json({ message: 'Missing required lesson fields: course_id, title, video_url, or order_number.' });
    }
    
    const sql = `
        INSERT INTO lessons (course_id, title, video_url, notes, order_number) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [course_id, title, video_url, notes, order_number], function(err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'A lesson with that order number already exists in this course.' });
            }
            return res.status(500).json({ message: 'Database error: Could not add lesson.', error: err.message });
        }
        
        res.status(201).json({ 
            message: 'Lesson added successfully.', 
            lessonId: this.lastID 
        });
    });
};

const getLessonsByCourse = async (req, res) => {
    const { courseId } = req.params;

    const sql = `
        SELECT id, title, video_url, notes, order_number, created_at
        FROM lessons 
        WHERE course_id = ? 
        ORDER BY order_number ASC
    `;

    db.all(sql, [courseId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not retrieve lessons.', error: err.message });
        }
        
        res.status(200).json({ 
            message: `Lessons for course ${courseId} retrieved successfully.`,
            count: rows.length,
            lessons: rows 
        });
    });
};

const updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, video_url, notes, order_number } = req.body;
    
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    let fields = [];
    let values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (video_url !== undefined) { fields.push('video_url = ?'); values.push(video_url); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (order_number !== undefined) { fields.push('order_number = ?'); values.push(order_number); }
    
    values.push(id); 

    const sql = `
        UPDATE lessons 
        SET ${fields.join(', ')} 
        WHERE id = ?
    `;

    db.run(sql, values, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not update lesson.', error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: `Lesson with ID ${id} not found.` });
        }

        res.status(200).json({ 
            message: `Lesson ID ${id} updated successfully.`,
            changes: this.changes
        });
    });
};

const deleteLesson = async (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM lessons WHERE id = ?`;

    db.run(sql, id, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not delete lesson.', error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: `Lesson with ID ${id} not found.` });
        }

        res.status(200).json({ 
            message: `Lesson ID ${id} deleted successfully.`,
            changes: this.changes
        });
    });
};


module.exports = {
    addStudent, 
    updateStudent, 
    listAllStudents,
    addCourse,
    listAllCourses,
    updateCourse,
    deleteCourse,
    addLesson,
    getLessonsByCourse,
    updateLesson,
    deleteLesson,
    getPaymentsReport,
};
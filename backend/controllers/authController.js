// backend/controllers/authController.js

const db = require('../config/db');
const generateToken = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');

// Helper function to prepare user data for response
const formatUserResponse = (user, token) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: token,
});

// @desc    Register a new student user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        // 1. Check if user already exists
        db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
            if (row) return res.status(400).json({ message: 'User with that email already exists.' });

            // 2. Hash Password
            const hashedPassword = await hashPassword(password);
            const role = 'student'; // Default role for registration

            // 3. Insert new user into DB
            db.run(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role],
                function (insertErr) {
                    if (insertErr) {
                        return res.status(500).json({ message: 'Failed to create user.', error: insertErr.message });
                    }
                    
                    const userId = this.lastID;
                    const token = generateToken(userId, email, role);

                    res.status(201).json(formatUserResponse({ id: userId, name, email, role }, token));
                }
            );
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

// @desc    Authenticate a user & get token (Admin or Student)
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // 1. Find user by email
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
            if (!user) return res.status(401).json({ message: 'Invalid credentials (User not found).' });

            // 2. Compare passwords
            const isMatch = await comparePassword(password, user.password);

            if (user && isMatch) {
                // 3. Generate token and return user data
                const token = generateToken(user.id, user.email, user.role);

                res.json(formatUserResponse(user, token));

            } else {
                res.status(401).json({ message: 'Invalid credentials (Password mismatch).' });
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

// @desc    Update user profile (Name or Email)
// @route   PUT /auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Check if at least one field is provided
    if (!name && !email) {
        return res.status(400).json({ message: 'Please provide a new name or email.' });
    }

    let fields = [];
    let values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    
    // Add user ID for the WHERE clause
    values.push(userId); 

    const sql = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = ?
    `;

    db.run(sql, values, function(err) {
        if (err) {
            console.error(err.message);
             // Check for unique email constraint violation
            if (err.message.includes('UNIQUE constraint failed: users.email')) {
                return res.status(409).json({ message: 'Email already in use by another account.' });
            }
            return res.status(500).json({ message: 'Database error: Could not update profile.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found or no changes were made.' });
        }
        
        // Return updated data (excluding password)
        db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId], (selectErr, user) => {
            if (selectErr) return res.status(500).json({ message: 'Error retrieving updated user data.' });
            res.status(200).json({ 
                message: 'Profile updated successfully.',
                user: user
            });
        });
    });
};

// @desc    Update user password
// @route   PUT /auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Must provide current and new passwords.' });
    }

    // 1. Fetch user to verify current password
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error fetching user.' });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        // 2. Compare current password
        const isMatch = await comparePassword(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // 3. Hash new password
        const newHashedPassword = await hashPassword(newPassword);

        // 4. Update password in DB
        db.run('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, userId], function(updateErr) {
            if (updateErr) {
                console.error(updateErr.message);
                return res.status(500).json({ message: 'Database error: Could not update password.' });
            }
            
            res.status(200).json({ message: 'Password updated successfully.' });
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    updatePassword,
};
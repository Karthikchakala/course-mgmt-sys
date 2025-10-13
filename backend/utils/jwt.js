// backend/utils/jwt.js

const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT).
 * @param {number} id - The user's database ID.
 * @param {string} email - The user's email.
 * @param {string} role - The user's role ('admin' or 'student').
 * @returns {string} The generated JWT.
 */
const generateToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        }
    );
};

module.exports = generateToken;
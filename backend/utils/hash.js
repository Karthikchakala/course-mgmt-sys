// backend/utils/hash.js

const bcrypt = require('bcrypt');

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password string.
 */
const hashPassword = async (password) => {
    // Salt rounds: 10 is a good standard default for security vs performance
    const salt = await bcrypt.genSalt(10); 
    return await bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hash - The stored hashed password.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
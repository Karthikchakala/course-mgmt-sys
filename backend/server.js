// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // Database connection and setup

// Load environment variables from .env file
dotenv.config(); 

const app = express();

// Middlewares
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Body parser for JSON data
app.use(express.urlencoded({ extended: true })); // Body parser for form data (Paytm callback)

// Simple root route
app.get('/', (req, res) => {
    res.send('CMS Backend API is running...');
});

// --- API Routes ---
// Import Route files here
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
// const studentRoutes = require('./routes/student'); 
const courseRoutes = require('./routes/course');
const orderRoutes = require('./routes/order');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
// app.use('/students', studentRoutes); // Student features, public routes
app.use('/courses', courseRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
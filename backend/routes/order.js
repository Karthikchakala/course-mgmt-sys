// backend/routes/order.js

const express = require('express');
const router = express.Router();

// Import necessary middlewares
const { protect, student } = require('../middlewares/authMiddleware');

// Import Controller functions
const { 
    initiatePaytmPayment, 
    verifyPaytmTransaction,
    listStudentOrders,
    markLessonCompleted
} = require('../controllers/orderController'); 

// -----------------------------------------------------------------
// 💳 Order & Payment Initiation Routes
// -----------------------------------------------------------------

// POST /orders/pay — Initiate Paytm payment
// Requires a logged-in student user
router.post('/pay', protect, student, initiatePaytmPayment);

// POST /orders/verify — Paytm Callback URL
// MUST BE PUBLIC (no protect middleware) for Paytm to send the verification data
router.post('/verify', verifyPaytmTransaction);


// -----------------------------------------------------------------
// 🎓 Student Dashboard & Progress Routes
// -----------------------------------------------------------------

// GET /orders — List student’s orders/payments
// Requires a logged-in student user
router.get('/', protect, student, listStudentOrders);

// POST /orders/progress — Mark a lesson as completed
// Requires a logged-in student user
router.post('/progress', protect, student, markLessonCompleted);

module.exports = router;
// // backend/controllers/orderController.js

// const db = require('../config/db');
// const Razorpay = require('razorpay'); 
// const crypto = require('crypto'); // Node.js built-in module for signature verification

// // Get keys from environment variables and initialize Razorpay instance
// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // -----------------------------------------------------------------
// // 💳 PAYMENT FLOW (Razorpay Implementation)
// // -----------------------------------------------------------------

// // @desc    Initiate Razorpay order creation
// // @route   POST /orders/pay
// // @access  Private/Student
// const initiateRazorpayPayment = async (req, res) => {
//     const { course_id, amount } = req.body;
//     const userId = req.user.id;
    
//     if (!course_id || !amount) {
//         return res.status(400).json({ message: 'Course ID and amount are required.' });
//     }

//     try {
//         // 1. Check if the student is already enrolled (Prevents duplicate orders)
//         const enrollmentCheck = await new Promise((resolve, reject) => {
//             db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id], (err, row) => {
//                 if (err) return reject(err);
//                 resolve(row);
//             });
//         });
        
//         if (enrollmentCheck) {
//             return res.status(409).json({ message: 'You are already enrolled in this course.' });
//         }

//         // Amount must be in the smallest currency unit (paise)
//         const amountInPaise = Math.round(amount * 100); 
//         const ORDER_ID_INTERNAL = 'CMS_ORDER_' + Date.now();

//         // 2. Create Order on Razorpay API
//         const razorpayOrder = await razorpayInstance.orders.create({
//             amount: amountInPaise,
//             currency: 'INR',
//             receipt: ORDER_ID_INTERNAL, 
//             notes: { 
//                 courseId: course_id, 
//                 userId: userId,
//             },
//         });

//         // 3. Insert order as PENDING into the database
//         const insertOrderSql = `
//             INSERT INTO orders (user_id, course_id, amount, order_id, txn_status, txn_details) 
//             VALUES (?, ?, ?, ?, ?, ?)  
//         `; 
        
//         await new Promise((resolve, reject) => {
//             db.run(insertOrderSql, 
//                 [
//                     userId, 
//                     course_id, 
//                     amount, 
//                     razorpayOrder.id, 
//                     'PENDING', 
//                     JSON.stringify({ receipt: ORDER_ID_INTERNAL, razorpay_order_id: razorpayOrder.id }) 
//                 ], 
//                 function(err) {
//                     if (err) return reject(err);
//                     resolve(this.lastID);
//                 });
//         });

//         // 4. Send data back to frontend to open the Razorpay modal
//         res.status(200).json({
//             message: 'Razorpay order created.',
//             orderId: razorpayOrder.id, 
//             amount: amount,
//             keyId: process.env.RAZORPAY_KEY_ID, 
//             name: req.user.name,
//             email: req.user.email,
//         });

//     } catch (error) {
//         console.error('Razorpay initiation failed:', error);
//         res.status(500).json({ message: 'Failed to create payment order.', error: error.message });
//     }
// };

// // @desc    Verify Razorpay payment signature and finalize enrollment
// // @route   POST /orders/verify
// // @access  Public (Called by frontend after successful payment handler)
// const verifyRazorpayTransaction = async (req, res) => {
//     // Data sent from the successful frontend handler
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id, user_id, amount } = req.body;
    
//     // 1. Verify the Signature (Security Check)
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');

//     if (generatedSignature !== razorpay_signature) {
//         // Log security breach attempt!
//         console.error('RAZORPAY SECURITY FAILED: Signature mismatch.');
//         return res.status(400).json({ message: 'Payment verification failed (Signature mismatch).' });
//     }

//     // 2. Signature matched. Update Order Status and Enroll.
    
//     // Data to store in txn_details
//     const txnDetails = JSON.stringify({
//         payment_id: razorpay_payment_id,
//         signature: razorpay_signature,
//         verified: true,
//     });

//     const updateSql = `
//         UPDATE orders 
//         SET txn_status = 'TXN_SUCCESS', txn_id = ?, txn_details = ? 
//         WHERE order_id = ? AND user_id = ?
//     `;

//     db.run(updateSql, [razorpay_payment_id, txnDetails, razorpay_order_id, user_id], function(err) {
//         if (err) {
//             console.error('DB Update Error during enrollment:', err.message);
//             // Even if DB update fails, enrollment attempt proceeds as payment was successful
//         }

//         // 3. Finalize Enrollment (Insert into enrollments table)
//         const enrollSql = `
//             INSERT OR IGNORE INTO enrollments (user_id, course_id, order_id) 
//             SELECT ?, ?, id FROM orders WHERE order_id = ?
//         `;
        
//         db.run(enrollSql, [user_id, course_id, razorpay_order_id], (enrollErr) => {
//             if (enrollErr) {
//                  console.error('Enrollment Error:', enrollErr.message);
//                  return res.status(500).json({ message: 'Enrollment failed despite successful payment.' });
//             }
            
//             res.status(200).json({ message: 'Payment verified and enrollment finalized.' });
//         });
//     });
// };


// // -----------------------------------------------------------------
// // 🎓 STUDENT DASHBOARD & PROGRESS (Existing Functions)
// // -----------------------------------------------------------------

// const listStudentOrders = async (req, res) => {
//     const userId = req.user.id; 

//     const sql = `
//         SELECT 
//             o.id, o.order_id, o.amount, o.txn_status, o.created_at,
//             c.title AS course_title
//         FROM orders o
//         JOIN courses c ON o.course_id = c.id
//         WHERE o.user_id = ?
//         ORDER BY o.created_at DESC
//     `;

//     db.all(sql, [userId], (err, orders) => {
//         if (err) {
//             console.error(err.message);
//             return res.status(500).json({ message: 'Database error: Could not retrieve orders.' });
//         }
//         res.status(200).json({ 
//             message: 'Order history retrieved successfully.',
//             orders: orders 
//         });
//     });
// };

// const markLessonCompleted = async (req, res) => {
//     const { lesson_id, course_id } = req.body;
//     const userId = req.user.id;

//     if (!lesson_id || !course_id) {
//         return res.status(400).json({ message: 'Lesson ID and Course ID are required.' });
//     }

//     db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id], (err, enrollment) => {
//         if (err) return res.status(500).json({ message: 'Database error during enrollment check.' });
//         if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course.' });

//         const sql = `
//             INSERT OR IGNORE INTO progress (user_id, lesson_id, course_id) 
//             VALUES (?, ?, ?)
//         `;

//         db.run(sql, [userId, lesson_id, course_id], function(insertErr) {
//             if (insertErr) {
//                 console.error(insertErr.message);
//                 return res.status(500).json({ message: 'Failed to update progress.' });
//             }

//             const message = this.changes > 0 ? 'Lesson marked as completed.' : 'Lesson already marked as completed.';
//             res.status(200).json({ message: message });
//         });
//     });
// };


// module.exports = {
//     // Renamed exported functions to use the new logic
//     initiatePaytmPayment: initiateRazorpayPayment, 
//     verifyPaytmTransaction: verifyRazorpayTransaction,
//     listStudentOrders,
//     markLessonCompleted,
// };

// backend/controllers/orderController.js

const db = require('../config/db');
const Razorpay = require('razorpay'); 
const crypto = require('crypto'); // Node.js built-in module for signature verification

// Get keys from environment variables and initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -----------------------------------------------------------------
// 💳 PAYMENT FLOW (Razorpay Implementation)
// -----------------------------------------------------------------

// @desc    Initiate Razorpay order creation
// @route   POST /orders/pay
// @access  Private/Student
const initiateRazorpayPayment = async (req, res) => {
    const { course_id, amount } = req.body;
    const userId = req.user.id;
    
    if (!course_id || !amount) {
        return res.status(400).json({ message: 'Course ID and amount are required.' });
    }

    try {
        // 1. Check if the student is already enrolled (Prevents duplicate orders)
        const enrollmentCheck = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        
        if (enrollmentCheck) {
            return res.status(409).json({ message: 'You are already enrolled in this course.' });
        }

        // Amount must be in the smallest currency unit (paise)
        const amountInPaise = Math.round(amount * 100); 
        const ORDER_ID_INTERNAL = 'CMS_ORDER_' + Date.now();

        // 2. Create Order on Razorpay API
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: ORDER_ID_INTERNAL, 
            notes: { 
                courseId: course_id, 
                userId: userId,
            },
        });

        // 3. Insert order as PENDING into the database (FIXED SQL)
        const insertOrderSql = `
            INSERT INTO orders (user_id, course_id, amount, order_id, txn_status, txn_details) 
            VALUES (?, ?, ?, ?, ?, ?)  
        `; 
        
        await new Promise((resolve, reject) => {
            db.run(insertOrderSql, 
                [
                    userId, 
                    course_id, 
                    amount, 
                    razorpayOrder.id, 
                    'PENDING', 
                    JSON.stringify({ receipt: ORDER_ID_INTERNAL, razorpay_order_id: razorpayOrder.id }) 
                ], 
                function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
        });

        // 4. Send data back to frontend to open the Razorpay modal
        res.status(200).json({
            message: 'Razorpay order created.',
            orderId: razorpayOrder.id, 
            amount: amount,
            keyId: process.env.RAZORPAY_KEY_ID, 
            name: req.user.name,
            email: req.user.email,
        });

    } catch (error) {
        console.error('Razorpay initiation failed:', error);
        res.status(500).json({ message: 'Failed to create payment order.', error: error.message });
    }
};

// @desc    Verify Razorpay payment signature and finalize enrollment
// @route   POST /orders/verify
// @access  Public (Called by frontend after successful payment handler)
const verifyRazorpayTransaction = async (req, res) => {
    // Data sent from the successful frontend handler
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id, user_id } = req.body;
    
    // 1. Verify the Signature (Security Check)
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
        console.error('RAZORPAY SECURITY FAILED: Signature mismatch.');
        return res.status(400).json({ message: 'Payment verification failed (Signature mismatch).' });
    }

    // 2. Signature matched. Update Order Status and Enroll.
    
    // Data to store in txn_details
    const txnDetails = JSON.stringify({
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        verified: true,
    });

    const updateSql = `
        UPDATE orders 
        SET txn_status = 'TXN_SUCCESS', txn_id = ?, txn_details = ? 
        WHERE order_id = ? AND user_id = ?
    `;

    db.run(updateSql, [razorpay_payment_id, txnDetails, razorpay_order_id, user_id], function(err) {
        if (err) {
            console.error('DB Update Error during enrollment:', err.message);
        }

        // 3. Finalize Enrollment (Insert into enrollments table)
        // Select the internal primary key ID from the orders table and use it as the foreign key
        const enrollSql = `
            INSERT OR IGNORE INTO enrollments (user_id, course_id, order_id) 
            SELECT ?, ?, id FROM orders WHERE order_id = ?
        `;
        
        db.run(enrollSql, [user_id, course_id, razorpay_order_id], (enrollErr) => {
            if (enrollErr) {
                 console.error('Enrollment Error:', enrollErr.message);
                 return res.status(500).json({ message: 'Enrollment failed despite successful payment.' });
            }
            
            res.status(200).json({ message: 'Payment verified and enrollment finalized.' });
        });
    });
};


// -----------------------------------------------------------------
// 🎓 STUDENT DASHBOARD & PROGRESS (Existing Functions)
// -----------------------------------------------------------------

const listStudentOrders = async (req, res) => {
    const userId = req.user.id; 

    const sql = `
        SELECT 
            o.id, o.order_id, o.amount, o.txn_status, o.created_at,
            c.title AS course_title,
            o.course_id 
        FROM orders o
        JOIN courses c ON o.course_id = c.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `;

    db.all(sql, [userId], (err, orders) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Database error: Could not retrieve orders.' });
        }
        res.status(200).json({ 
            message: 'Order history retrieved successfully.',
            orders: orders 
        });
    });
};

const markLessonCompleted = async (req, res) => {
    const { lesson_id, course_id } = req.body;
    const userId = req.user.id;

    if (!lesson_id || !course_id) {
        return res.status(400).json({ message: 'Lesson ID and Course ID are required.' });
    }

    db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id], (err, enrollment) => {
        if (err) return res.status(500).json({ message: 'Database error during enrollment check.' });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course.' });

        const sql = `
            INSERT OR IGNORE INTO progress (user_id, lesson_id, course_id) 
            VALUES (?, ?, ?)
        `;

        db.run(sql, [userId, lesson_id, course_id], function(insertErr) {
            if (insertErr) {
                console.error(insertErr.message);
                return res.status(500).json({ message: 'Failed to update progress.' });
            }

            const message = this.changes > 0 ? 'Lesson marked as completed.' : 'Lesson already marked as completed.';
            res.status(200).json({ message: message });
        });
    });
};


module.exports = {
    // These match the function names in the controller file
    initiatePaytmPayment: initiateRazorpayPayment, 
    verifyPaytmTransaction: verifyRazorpayTransaction,
    listStudentOrders,
    markLessonCompleted,
};
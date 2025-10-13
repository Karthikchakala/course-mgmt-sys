// backend/controllers/orderController.js

const db = require('../config/db');
const { generatePaytmChecksum, verifyPaytmChecksum } = require('../utils/paytm'); 

// -----------------------------------------------------------------
// 💳 PAYMENT FLOW (Implementation)
// -----------------------------------------------------------------

// @desc    Initiate Paytm payment
// @route   POST /orders/pay
// @access  Private/Student
const initiatePaytmPayment = async (req, res) => {
    const { course_id, amount } = req.body;
    const userId = req.user.id;
    
    if (!course_id || !amount) {
        return res.status(400).json({ message: 'Course ID and amount are required.' });
    }

    try {
        // 1. Check if the student is already enrolled
        const enrollmentCheck = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        
        if (enrollmentCheck) {
            return res.status(409).json({ message: 'You are already enrolled in this course.' });
        }


        // 2. Generate a unique Order ID and insert order as PENDING
        const ORDER_ID = 'ORDER_' + Date.now() + userId;

        const insertOrderSql = `
            INSERT INTO orders (user_id, course_id, amount, order_id, txn_status) 
            VALUES (?, ?, ?, ?, 'PENDING')
        `;
        
        await new Promise((resolve, reject) => {
            db.run(insertOrderSql, [userId, course_id, amount, ORDER_ID], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        // 3. Generate Checksum
        const txnParams = { 
            ORDER_ID, 
            amount: parseFloat(amount), 
            user_id: userId, 
            course_id: course_id 
        };
        const paytmParams = generatePaytmChecksum(txnParams);

        // 4. Send checksum and parameters back to frontend for redirection to Paytm
        res.status(200).json({
            message: 'Payment initiation successful. Redirect to Paytm.',
            paytmParams: paytmParams
        });

    } catch (error) {
        console.error('Error initiating payment:', error.message);
        res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
    }
};

// @desc    Verify Paytm transaction and finalize enrollment
// @route   POST /orders/verify
// @access  Public (Paytm callback)
const verifyPaytmTransaction = async (req, res) => {
    const receivedParams = req.body;
    const orderId = receivedParams.ORDERID;
    const transactionStatus = receivedParams.STATUS;
    const courseId = receivedParams.course_id; 
    const frontendBaseUrl = 'http://localhost:3000'; // Target frontend URL

    // 1. Verify Checksum
    const isValidChecksum = verifyPaytmChecksum(receivedParams);
    
    if (!isValidChecksum) {
        console.error(`Invalid Checksum received for Order ID: ${orderId}`);
        return res.redirect(`${frontendBaseUrl}/payment-status?status=failure&order=${orderId}&reason=invalid_checksum`);
    }

    // 2. Update Order Status in DB
    const updateSql = `
        UPDATE orders 
        SET txn_status = ?, txn_id = ?, txn_details = ? 
        WHERE order_id = ?
    `;

    db.run(updateSql, [transactionStatus, receivedParams.TXNID, JSON.stringify(receivedParams), orderId], function(err) {
        if (err) {
            console.error('DB Update Error:', err.message);
            return res.redirect(`${frontendBaseUrl}/payment-status?status=failure&order=${orderId}&reason=db_error`);
        }

        // 3. Finalize Enrollment if SUCCESS
        if (transactionStatus === 'TXN_SUCCESS') {
            const userId = receivedParams.CUST_ID;
            
            db.get('SELECT id FROM orders WHERE order_id = ?', [orderId], (err, orderRow) => {
                if (err || !orderRow) {
                    console.error('Failed to find internal order ID:', err ? err.message : 'Not found');
                    return res.redirect(`${frontendBaseUrl}/payment-status?status=failure&order=${orderId}&reason=enrollment_fail`);
                }
                
                // Insert into enrollments table (safe due to INSERT OR IGNORE)
                const enrollSql = `
                    INSERT OR IGNORE INTO enrollments (user_id, course_id, order_id) 
                    VALUES (?, ?, ?)
                `;
                db.run(enrollSql, [userId, courseId, orderRow.id], (enrollErr) => {
                    if (enrollErr) {
                         console.error('Enrollment Error:', enrollErr.message);
                    }
                    // Redirect to success page on frontend
                    res.redirect(`${frontendBaseUrl}/payment-status?status=success&order=${orderId}&course=${courseId}`);
                });
            });
            
        } else {
            // Transaction failed/pending
            res.redirect(`${frontendBaseUrl}/payment-status?status=failure&order=${orderId}&reason=${transactionStatus}`);
        }
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
            c.title AS course_title
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
    initiatePaytmPayment,
    verifyPaytmTransaction,
    listStudentOrders,
    markLessonCompleted,
};
// backend/config/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Path to the database file (will be created in the 'backend' folder)
const DB_PATH = path.resolve(__dirname, '..', 'database.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Could not connect to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database. File:', DB_PATH);
        // Execute table creation and admin seeding after successful connection
        setupDatabase();
    }
});

// SQL statements for all table creations
const CREATE_TABLES_SQL = `
    -- Enable foreign key constraints in SQLite
    PRAGMA foreign_keys = ON;

    -- 1. Users Table (Admins and Students)
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Courses Table
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL CHECK(price >= 0),
        image_url TEXT,
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Lessons Table
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        notes TEXT,
        order_number INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE (course_id, order_number)
    );

    -- 4. Orders/Payments Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    order_id TEXT UNIQUE NOT NULL, -- Razorpay Order ID
    txn_id TEXT,                   -- Razorpay Transaction ID
    txn_status TEXT NOT NULL CHECK(txn_status IN ('PENDING','TXN_SUCCESS','TXN_FAILED')),
    txn_details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

    -- 5. Enrollments Table (successful course purchases)
    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        order_id INTEGER UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        UNIQUE (user_id, course_id)
    );

    -- 6. Progress Table (student lesson completion)
    CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 1, -- 1 for true
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
        UNIQUE (user_id, lesson_id)
    );
`;

/**
 * Executes the database setup: creating tables and seeding the Admin user.
 */
function setupDatabase() {
    // 1. Create all tables
    db.exec(CREATE_TABLES_SQL, (err) => {
        if (err) {
            console.error('❌ Error creating tables:', err.message);
        } else {
            console.log('✅ All database tables created successfully.');
            // 2. Seed Admin user
            seedAdminUser();
        }
    });

    // SQLite Trigger to update the 'updated_at' timestamp before any update on users
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_user_timestamp
        AFTER UPDATE ON users
        FOR EACH ROW
        BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    `);
}

/**
 * Seeds a default 'admin' user into the database if one does not exist.
 */
async function seedAdminUser() {
    // IMPORTANT: Use environment variables for the actual credentials in .env
    const ADMIN_EMAIL = 'admin@cms.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword123'; 

    // Check if the admin user already exists
    db.get(`SELECT id FROM users WHERE email = ? AND role = 'admin'`, [ADMIN_EMAIL], async (err, row) => {
        if (err) {
            console.error('Error checking for admin user:', err.message);
            return;
        }

        if (!row) {
            // Admin user does not exist, create one
            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                
                const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
                db.run(sql, ["CMS Administrator", ADMIN_EMAIL, hashedPassword, 'admin'], function(insertErr) {
                    if (insertErr) {
                        console.error('❌ Error seeding admin user:', insertErr.message);
                    } else {
                        console.log(`🔑 Default Admin user created: ${ADMIN_EMAIL}. Password: ${ADMIN_PASSWORD} (Change immediately!)`);
                    }
                });
            } catch (hashErr) {
                console.error('❌ Error hashing admin password:', hashErr.message);
            }
        } else {
            // console.log('Admin user already exists. Skipping seed.');
        }
    });
}

// Export the database instance for use in controllers/models
module.exports = db;
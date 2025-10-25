// backend/check_db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        return;
    }
    console.log("Database opened successfully. Running query...");
    
    // Query to check if Course ID 2 exists
    db.get(`SELECT id, title FROM courses WHERE id = 2`, (err, row) => {
        if (err) {
            console.error("SQL Error:", err.message);
        } else if (row) {
            console.log(`✅ SUCCESS: Course ID ${row.id} found: "${row.title}"`);
        } else {
            console.log("❌ FAILURE: Course ID 2 NOT FOUND in the 'courses' table.");
            console.log("Action required: Re-insert the course via the Admin API.");
        }
        db.close();
    });
});
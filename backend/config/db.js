const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in backend directory
const dbPath = path.join(__dirname, '..', 'ems.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
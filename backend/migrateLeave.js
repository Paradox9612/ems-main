const db = require('./config/db');

console.log('Starting leave table migration...');

// Add missing columns to leave_applications table
const migrations = [
  'ALTER TABLE leave_applications ADD COLUMN leave_type TEXT NOT NULL DEFAULT "Sick Leave"',
  'ALTER TABLE leave_applications ADD COLUMN department TEXT NOT NULL DEFAULT "General"',
  'ALTER TABLE leave_applications ADD COLUMN days INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE leave_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  'ALTER TABLE leave_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP'
];

let completed = 0;
const total = migrations.length;

migrations.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`Migration ${index + 1} failed:`, err.message);
    } else {
      console.log(`Migration ${index + 1} completed successfully`);
    }

    completed++;
    if (completed === total) {
      console.log('All migrations completed!');
      db.close();
    }
  });
});
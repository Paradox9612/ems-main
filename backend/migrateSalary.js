const db = require('./config/db');

console.log('Migrating salary table...');

// Add missing columns to salaries table
const migrations = [
  'ALTER TABLE salaries ADD COLUMN base_salary REAL DEFAULT 0',
  'ALTER TABLE salaries ADD COLUMN incentives REAL DEFAULT 0',
  'ALTER TABLE salaries ADD COLUMN deductions REAL DEFAULT 0',
  'ALTER TABLE salaries ADD COLUMN status TEXT DEFAULT "pending"'
];

migrations.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`Migration ${index + 1} failed:`, err);
    } else {
      console.log(`Migration ${index + 1} completed successfully`);
    }
  });
});

console.log('Migration completed');
db.close();
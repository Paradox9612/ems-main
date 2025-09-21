const db = require('./config/db');

console.log('Migrating documents table...');

// Add file_size column to documents table
const migrations = [
  'ALTER TABLE documents ADD COLUMN file_size INTEGER DEFAULT 0'
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
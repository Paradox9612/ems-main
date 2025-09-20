const db = require('./config/db');

console.log('Checking attendance records...');

db.all('SELECT * FROM attendance', [], (err, records) => {
  if (err) {
    console.error('Error querying attendance:', err);
  } else {
    console.log('Attendance records:', records);
  }
  db.close();
});
const db = require('./config/db');

db.all('SELECT * FROM leave_applications', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Leaves:', rows);
  }
  db.close();
});
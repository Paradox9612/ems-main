const db = require('./config/db');

db.all('SELECT * FROM documents', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Documents:', rows);
  }
  db.close();
});
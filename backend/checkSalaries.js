const db = require('./config/db');

db.all('SELECT * FROM salaries', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Salaries:', rows);
  }
  db.close();
});
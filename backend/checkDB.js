const db = require('./config/db');

console.log('Checking database contents...');

// Check users table
db.all('SELECT * FROM users', [], (err, users) => {
  if (err) {
    console.error('Error querying users:', err);
  } else {
    console.log('Users:', users);
  }

  // Check employees table
  db.all('SELECT * FROM employees', [], (err, employees) => {
    if (err) {
      console.error('Error querying employees:', err);
    } else {
      console.log('Employees:', employees);
    }

    db.close();
  });
});
const db = require('./config/db');

console.log('Fixing missing employee records...');

// Get all users with employee role
db.all('SELECT id, firstName, lastName FROM users WHERE role = "employee"', [], (err, users) => {
  if (err) {
    console.error('Error getting users:', err);
    return;
  }

  console.log('Users with employee role:', users);

  // Check which ones don't have employee records
  let processed = 0;
  users.forEach(user => {
    db.get('SELECT id FROM employees WHERE user_id = ?', [user.id], (err, employee) => {
      if (err) {
        console.error('Error checking employee:', err);
        return;
      }

      if (!employee) {
        // Create employee record
        db.run(
          'INSERT INTO employees (user_id, phone, position, department) VALUES (?, ?, ?, ?)',
          [user.id, '', 'Employee', 'General'],
          function(err) {
            if (err) {
              console.error('Error creating employee record for user', user.id, ':', err);
            } else {
              console.log('Created employee record for user:', user.firstName, user.lastName, '(ID:', user.id, ')');
            }
            processed++;
            if (processed === users.length) {
              console.log('Finished processing all users');
              db.close();
            }
          }
        );
      } else {
        console.log('Employee record already exists for user:', user.firstName, user.lastName);
        processed++;
        if (processed === users.length) {
          console.log('Finished processing all users');
          db.close();
        }
      }
    });
  });
});
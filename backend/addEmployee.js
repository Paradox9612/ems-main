const db = require('./config/db');

const addEmployee = () => {
  db.run(
    `INSERT INTO employees (user_id, phone, position, department)
     VALUES (?, ?, ?, ?)`,
    [1, '1234567890', 'Developer', 'IT'],
    function(err) {
      if (err) {
        console.error('Error adding employee:', err);
      } else {
        console.log('Employee added successfully, ID:', this.lastID);
      }
      db.close();
    }
  );
};

addEmployee();
const db = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async (req, res) => {
  try {
    // Get all users with employee role and their employee details
    const query = `
      SELECT
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.created_at,
        e.phone,
        e.position,
        e.department,
        e.hireDate,
        e.salary,
        e.status
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.role = 'employee'
      ORDER BY u.created_at DESC
    `;

    const employees = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ employees });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, position, department, hireDate, salary } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user account
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'employee'
    });

    // Create employee record
    const employeeData = {
      user_id: newUser.id,
      phone: phone || '',
      position: position || 'Employee',
      department: department || 'General',
      hireDate: hireDate || null,
      salary: salary ? parseFloat(salary) : null,
      status: 'active'
    };

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO employees (user_id, phone, position, department, hireDate, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [employeeData.user_id, employeeData.phone, employeeData.position, employeeData.department, employeeData.hireDate, employeeData.salary, employeeData.status],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Return employee data without password
    const employeeResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      phone: employeeData.phone,
      position: employeeData.position,
      department: employeeData.department,
      hireDate: employeeData.hireDate,
      salary: employeeData.salary,
      status: employeeData.status,
      created_at: newUser.created_at
    };

    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeResponse
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, position, department, hireDate, salary, status } = req.body;

    // Update user table
    if (firstName || lastName || email) {
      let updateFields = [];
      let updateValues = [];

      if (firstName) {
        updateFields.push('firstName = ?');
        updateValues.push(firstName);
      }
      if (lastName) {
        updateFields.push('lastName = ?');
        updateValues.push(lastName);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues,
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });
      }
    }

    // Update employee table
    if (phone || position || department || hireDate || salary || status) {
      let updateFields = [];
      let updateValues = [];

      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      if (position) {
        updateFields.push('position = ?');
        updateValues.push(position);
      }
      if (department) {
        updateFields.push('department = ?');
        updateValues.push(department);
      }
      if (hireDate !== undefined) {
        updateFields.push('hireDate = ?');
        updateValues.push(hireDate);
      }
      if (salary !== undefined) {
        updateFields.push('salary = ?');
        updateValues.push(salary);
      }
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE employees SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues,
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });
      }
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from employees table first (due to foreign key constraint)
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE user_id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    // Delete from users table
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.created_at,
        e.phone,
        e.position,
        e.department,
        e.hireDate,
        e.salary,
        e.status
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ? AND u.role = 'employee'
    `;

    const employee = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
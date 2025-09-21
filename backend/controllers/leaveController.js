const db = require('../config/db');

// Create a new leave application
exports.createLeave = async (req, res) => {
  try {
    const { leaveType, department, startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    // First, find the employee record for this user
    const employeeSql = 'SELECT id FROM employees WHERE user_id = ?';
    const employee = await new Promise((resolve, reject) => {
      db.get(employeeSql, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found. Please contact administrator.' });
    }

    const employeeId = employee.id;

    // Validate required fields
    if (!leaveType || !department || !startDate || !endDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    if (start < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    // Calculate days
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Insert leave application
    const sql = `
      INSERT INTO leave_applications (employee_id, leave_type, department, start_date, end_date, days, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.run(sql, [employeeId, leaveType, department, startDate, endDate, days, reason], function(err) {
      if (err) {
        console.error('Error creating leave:', err);
        return res.status(500).json({ error: 'Failed to create leave application' });
      }

      res.status(201).json({
        message: 'Leave application submitted successfully',
        leave: {
          id: this.lastID,
          employee_id: employeeId,
          leave_type: leaveType,
          department,
          start_date: startDate,
          end_date: endDate,
          days,
          reason,
          status: 'pending'
        }
      });
    });

  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get employee's own leave applications
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const userId = req.user.id;

    // First, find the employee record for this user
    const employeeSql = 'SELECT id FROM employees WHERE user_id = ?';
    const employee = await new Promise((resolve, reject) => {
      db.get(employeeSql, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found. Please contact administrator.' });
    }

    const employeeId = employee.id;

    const sql = `
      SELECT la.*, u.firstName, u.lastName, u.email
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE la.employee_id = ?
      ORDER BY la.created_at DESC
    `;

    db.all(sql, [employeeId], (err, rows) => {
      if (err) {
        console.error('Error fetching employee leaves:', err);
        return res.status(500).json({ error: 'Failed to fetch leave applications' });
      }

      res.json({ leaves: rows });
    });

  } catch (error) {
    console.error('Get employee leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all leave applications (admin only)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, empId, name } = req.query;

    let sql = `
      SELECT la.*, u.firstName, u.lastName, u.email, e.phone
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      sql += ' AND la.status = ?';
      params.push(status);
    }

    if (empId) {
      sql += ' AND u.id = ?';
      params.push(empId);
    }

    if (name) {
      sql += ' AND (u.firstName LIKE ? OR u.lastName LIKE ?)';
      params.push(`%${name}%`, `%${name}%`);
    }

    sql += ' ORDER BY la.created_at DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error fetching all leaves:', err);
        return res.status(500).json({ error: 'Failed to fetch leave applications' });
      }

      res.json({ leaves: rows });
    });

  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update leave status (admin only)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const sql = 'UPDATE leave_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    db.run(sql, [status, id], function(err) {
      if (err) {
        console.error('Error updating leave status:', err);
        return res.status(500).json({ error: 'Failed to update leave status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }

      res.json({ message: `Leave application ${status} successfully` });
    });

  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get leave statistics (admin only)
exports.getLeaveStats = async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(*) as total
      FROM leave_applications
    `;

    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('Error fetching leave stats:', err);
        return res.status(500).json({ error: 'Failed to fetch leave statistics' });
      }

      res.json({
        stats: {
          pending: row.pending || 0,
          approved: row.approved || 0,
          rejected: row.rejected || 0,
          total: row.total || 0
        }
      });
    });

  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete leave application (employee can delete if pending)
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let sql;
    let params;

    if (isAdmin) {
      sql = 'DELETE FROM leave_applications WHERE id = ?';
      params = [id];
    } else {
      // First, find the employee record for this user
      const employeeSql = 'SELECT id FROM employees WHERE user_id = ?';
      const employee = await new Promise((resolve, reject) => {
        db.get(employeeSql, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found. Please contact administrator.' });
      }

      sql = 'DELETE FROM leave_applications WHERE id = ? AND employee_id = ? AND status = "pending"';
      params = [id, employee.id];
    }

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error deleting leave:', err);
        return res.status(500).json({ error: 'Failed to delete leave application' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Leave application not found or cannot be deleted' });
      }

      res.json({ message: 'Leave application deleted successfully' });
    });

  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
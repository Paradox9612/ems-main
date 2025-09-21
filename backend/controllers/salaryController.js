const db = require('../config/db');

exports.getAllSalaries = async (req, res) => {
  try {
    const query = `
      SELECT
        s.id,
        s.employee_id,
        s.amount,
        s.month,
        s.year,
        s.paid_at,
        s.base_salary,
        s.incentives,
        s.deductions,
        s.status,
        u.firstName,
        u.lastName,
        u.email
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      ORDER BY s.year DESC, s.month DESC, s.paid_at DESC
    `;

    const salaries = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ salaries });
  } catch (error) {
    console.error('Get all salaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeSalaries = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.id;

    // If not admin, only allow viewing own salaries
    let actualEmployeeId = employeeId;
    if (!req.user.role === 'admin') {
      // Find employee's employee_id from user_id
      const employee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      actualEmployeeId = employee.id;
    }

    const query = `
      SELECT
        s.id,
        s.employee_id,
        s.amount,
        s.month,
        s.year,
        s.paid_at,
        s.base_salary,
        s.incentives,
        s.deductions,
        s.status
      FROM salaries s
      WHERE s.employee_id = ?
      ORDER BY s.year DESC, s.month DESC
    `;

    const salaries = await new Promise((resolve, reject) => {
      db.all(query, [actualEmployeeId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ salaries });
  } catch (error) {
    console.error('Get employee salaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createSalary = async (req, res) => {
  try {
    console.log('Create salary request body:', req.body);
    const { employeeId, month, year, baseSalary, incentives, deductions, status } = req.body;

    if (!employeeId || !month || !year || !baseSalary) {
      return res.status(400).json({ error: 'Employee ID, month, year, and base salary are required' });
    }

    // Check if employee exists (employeeId is user_id from frontend)
    const employee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE user_id = ?', [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(400).json({ error: 'Employee does not exist' });
    }

    const actualEmployeeId = employee.id;

    // Check if salary record already exists for this employee/month/year
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM salaries WHERE employee_id = ? AND month = ? AND year = ?',
        [actualEmployeeId, month, year],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      return res.status(409).json({ error: 'Salary record already exists for this employee and period' });
    }

    const incentivesAmount = parseFloat(incentives) || 0;
    const deductionsAmount = parseFloat(deductions) || 0;
    const baseSalaryAmount = parseFloat(baseSalary);

    if (isNaN(baseSalaryAmount) || baseSalaryAmount < 0) {
      return res.status(400).json({ error: 'Invalid base salary amount' });
    }

    if (isNaN(incentivesAmount) || incentivesAmount < 0) {
      return res.status(400).json({ error: 'Invalid incentives amount' });
    }

    if (isNaN(deductionsAmount) || deductionsAmount < 0) {
      return res.status(400).json({ error: 'Invalid deductions amount' });
    }

    const totalAmount = baseSalaryAmount + incentivesAmount - deductionsAmount;

    console.log('Inserting salary:', { actualEmployeeId, totalAmount, month, year, baseSalaryAmount, incentivesAmount, deductionsAmount, status: status || 'pending' });

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO salaries (employee_id, amount, month, year, base_salary, incentives, deductions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [actualEmployeeId, totalAmount, month, year, baseSalaryAmount, incentivesAmount, deductionsAmount, status || 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      message: 'Salary record created successfully',
      salary: {
        id: result,
        employee_id: actualEmployeeId,
        amount: totalAmount,
        month,
        year,
        base_salary: baseSalaryAmount,
        incentives: incentivesAmount,
        deductions: deductionsAmount,
        status: status || 'pending'
      }
    });
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseSalary, incentives, deductions, status } = req.body;

    // Get current salary record
    const currentSalary = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM salaries WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!currentSalary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }

    const newBaseSalary = baseSalary !== undefined ? baseSalary : currentSalary.base_salary;
    const newIncentives = incentives !== undefined ? incentives : currentSalary.incentives;
    const newDeductions = deductions !== undefined ? deductions : currentSalary.deductions;
    const newStatus = status !== undefined ? status : currentSalary.status;

    const newTotalAmount = parseFloat(newBaseSalary) + parseFloat(newIncentives) - parseFloat(newDeductions);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE salaries SET amount = ?, base_salary = ?, incentives = ?, deductions = ?, status = ? WHERE id = ?',
        [newTotalAmount, newBaseSalary, newIncentives, newDeductions, newStatus, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({
      message: 'Salary record updated successfully',
      salary: {
        id,
        amount: newTotalAmount,
        base_salary: newBaseSalary,
        incentives: newIncentives,
        deductions: newDeductions,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM salaries WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    res.json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Delete salary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSalaryStats = async (req, res) => {
  try {
    // Get total paid amount
    const totalPaid = await new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(amount) as total FROM salaries WHERE status = "paid"',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    // Get total pending amount
    const totalPending = await new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(amount) as total FROM salaries WHERE status = "pending"',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    // Get average salary
    const averageSalary = await new Promise((resolve, reject) => {
      db.get(
        'SELECT AVG(amount) as average FROM salaries WHERE status = "paid"',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.average || 0);
        }
      );
    });

    // Get total records count
    const totalRecords = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM salaries',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    res.json({
      totalPaid: parseFloat(totalPaid),
      totalPending: parseFloat(totalPending),
      averageSalary: parseFloat(averageSalary),
      totalRecords: totalRecords
    });
  } catch (error) {
    console.error('Get salary stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeSalaryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find employee's employee_id from user_id
    const employee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    // Get employee's salary stats
    const totalPaid = await new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(amount) as total FROM salaries WHERE employee_id = ? AND status = "paid"',
        [employee.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    const totalPending = await new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(amount) as total FROM salaries WHERE employee_id = ? AND status = "pending"',
        [employee.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    const averageSalary = await new Promise((resolve, reject) => {
      db.get(
        'SELECT AVG(amount) as average FROM salaries WHERE employee_id = ? AND status = "paid"',
        [employee.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.average || 0);
        }
      );
    });

    const totalRecords = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM salaries WHERE employee_id = ?',
        [employee.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    res.json({
      totalPaid: parseFloat(totalPaid),
      totalPending: parseFloat(totalPending),
      averageSalary: parseFloat(averageSalary),
      totalRecords: totalRecords
    });
  } catch (error) {
    console.error('Get employee salary stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const Attendance = require('../models/Attendance');

exports.clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.id; // Get user ID from JWT token

    // If employeeId is not provided, try to find it from user ID
    let actualEmployeeId = employeeId;
    if (!actualEmployeeId) {
      // Look up employee record for this user
      const db = require('../config/db');
      const employee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found. Please contact administrator.' });
      }

      actualEmployeeId = employee.id;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const checkIn = now.toTimeString().split(' ')[0];

    // Check if already clocked in today
    const existing = await Attendance.getByEmployeeAndDate(actualEmployeeId, today);
    if (existing) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    // Determine status based on time (9 AM cutoff)
    const status = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0) ? 'late' : 'present';

    const result = await Attendance.clockIn(actualEmployeeId, today, checkIn, status);

    res.status(201).json({
      message: 'Clocked in successfully',
      attendance: {
        id: result.id,
        employeeId: actualEmployeeId,
        date: today,
        checkIn,
        status
      }
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;
    const checkOut = new Date().toTimeString().split(' ')[0];

    const result = await Attendance.clockOut(attendanceId, checkOut);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Clocked out successfully' });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const limit = parseInt(req.query.limit) || 30;

    // Look up employee record for this user
    const db = require('../config/db');
    const employee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found. Please contact administrator.' });
    }

    const records = await Attendance.getByEmployee(employee.id, limit);

    res.json({ records });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.getAllByDate(today);

    res.json({ records });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const stats = await Attendance.getTodayStats();

    res.json(stats);
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const records = await Attendance.getAllByDate(date);

    res.json({ records });
  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireAdmin, requireEmployee } = require('../middlewares/authMiddleware');

// POST /api/attendance/clock-in
router.post('/clock-in', authenticateToken, requireEmployee, attendanceController.clockIn);

// POST /api/attendance/clock-out
router.post('/clock-out', authenticateToken, requireEmployee, attendanceController.clockOut);

// GET /api/attendance/employee/:employeeId
router.get('/employee/:employeeId', authenticateToken, attendanceController.getEmployeeAttendance);

// GET /api/attendance/today
router.get('/today', authenticateToken, attendanceController.getTodayAttendance);

// GET /api/attendance/stats
router.get('/stats', authenticateToken, requireAdmin, attendanceController.getAttendanceStats);

// GET /api/attendance/date/:date
router.get('/date/:date', authenticateToken, attendanceController.getAttendanceByDate);

module.exports = router;
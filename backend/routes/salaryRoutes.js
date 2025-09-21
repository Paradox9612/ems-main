const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// GET /api/salaries - Get all salaries (admin only)
router.get('/', authenticateToken, requireAdmin, salaryController.getAllSalaries);

// GET /api/salaries/employee/:employeeId - Get salaries for specific employee
router.get('/employee/:employeeId', authenticateToken, salaryController.getEmployeeSalaries);

// GET /api/salaries/my - Get current user's own salaries
router.get('/my', authenticateToken, salaryController.getMySalaries);

// POST /api/salaries - Create new salary record (admin only)
router.post('/', authenticateToken, requireAdmin, salaryController.createSalary);

// PUT /api/salaries/:id - Update salary record (admin only)
router.put('/:id', authenticateToken, requireAdmin, salaryController.updateSalary);

// DELETE /api/salaries/:id - Delete salary record (admin only)
router.delete('/:id', authenticateToken, requireAdmin, salaryController.deleteSalary);

// GET /api/salaries/stats - Get salary statistics (admin only)
router.get('/stats/admin', authenticateToken, requireAdmin, salaryController.getSalaryStats);

// GET /api/salaries/stats/employee - Get employee's own salary statistics
router.get('/stats/employee', authenticateToken, salaryController.getEmployeeSalaryStats);

module.exports = router;
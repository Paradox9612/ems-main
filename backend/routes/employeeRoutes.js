const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// GET /api/employees - Get all employees (admin only)
router.get('/', authenticateToken, requireAdmin, employeeController.getAllEmployees);

// POST /api/employees - Create new employee (admin only)
router.post('/', authenticateToken, requireAdmin, employeeController.createEmployee);

// GET /api/employees/:id - Get employee by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, employeeController.getEmployeeById);

// PUT /api/employees/:id - Update employee (admin only)
router.put('/:id', authenticateToken, requireAdmin, employeeController.updateEmployee);

// DELETE /api/employees/:id - Delete employee (admin only)
router.delete('/:id', authenticateToken, requireAdmin, employeeController.deleteEmployee);

module.exports = router;
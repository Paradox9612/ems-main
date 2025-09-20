const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Employee routes
router.post('/', authenticateToken, leaveController.createLeave);
router.get('/', authenticateToken, leaveController.getEmployeeLeaves);
router.delete('/:id', authenticateToken, leaveController.deleteLeave);

// Admin routes
router.get('/admin', authenticateToken, requireAdmin, leaveController.getAllLeaves);
router.put('/:id/status', authenticateToken, requireAdmin, leaveController.updateLeaveStatus);
router.get('/stats/admin', authenticateToken, requireAdmin, leaveController.getLeaveStats);

module.exports = router;
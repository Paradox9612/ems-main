const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Get dashboard stats (admin only)
router.get('/stats', authenticateToken, requireAdmin, dashboardController.getDashboardStats);

module.exports = router;
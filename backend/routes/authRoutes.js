const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/signup
router.post('/signup', authController.signup);

// GET /api/auth/verify
router.get('/verify', authController.verifyToken);

module.exports = router;
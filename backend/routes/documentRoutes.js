const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken, requireAdmin, requireEmployee } = require('../middlewares/authMiddleware');

// POST /api/documents/upload - Upload new document (employees only)
router.post('/upload', authenticateToken, requireEmployee, documentController.uploadDocument);

// GET /api/documents - Get all documents (admin only)
router.get('/', authenticateToken, requireAdmin, documentController.getAllDocuments);

// GET /api/documents/employee - Get employee's own documents
router.get('/employee', authenticateToken, requireEmployee, documentController.getEmployeeDocuments);

// GET /api/documents/download/:id - Download document
router.get('/download/:id', authenticateToken, documentController.downloadDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', authenticateToken, documentController.deleteDocument);

module.exports = router;
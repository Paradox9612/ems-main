const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

exports.uploadDocument = [
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { documentType } = req.body;
      const userId = req.user.id;

      // Get employee record for this user
      const employee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found' });
      }

      const filePath = req.file.filename;

      // Save document record to database
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO documents (employee_id, document_type, file_path) VALUES (?, ?, ?)',
          [employee.id, documentType || 'other', filePath],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: result.id,
          employee_id: employee.id,
          document_type: documentType || 'other',
          file_path: filePath,
          uploaded_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

exports.getAllDocuments = async (req, res) => {
  try {
    const query = `
      SELECT
        d.id,
        d.employee_id,
        d.document_type,
        d.file_path,
        d.uploaded_at,
        u.firstName,
        u.lastName
      FROM documents d
      JOIN employees e ON d.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      ORDER BY d.uploaded_at DESC
    `;

    const documents = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get employee record for this user
    const employee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const query = `
      SELECT
        d.id,
        d.employee_id,
        d.document_type,
        d.file_path,
        d.uploaded_at
      FROM documents d
      WHERE d.employee_id = ?
      ORDER BY d.uploaded_at DESC
    `;

    const documents = await new Promise((resolve, reject) => {
      db.all(query, [employee.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get employee documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document record
    const document = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has permission to download (admin or document owner)
    if (!req.user.role === 'admin') {
      const employee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE user_id = ?', [req.user.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!employee || employee.id !== document.employee_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document record
    const document = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has permission to delete (admin or document owner)
    if (!req.user.role === 'admin') {
      const employee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE user_id = ?', [req.user.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!employee || employee.id !== document.employee_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const initDB = () => {
  const schemaPath = path.join(__dirname, 'models', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split schema into individual statements
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

  statements.forEach(statement => {
    db.run(statement.trim(), (err) => {
      if (err) {
        console.error('Error executing statement:', statement.trim());
        console.error(err);
      }
    });
  });

  console.log('Database initialized successfully');
};

initDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/salaries', require('./routes/salaryRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
// Add other routes as needed

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
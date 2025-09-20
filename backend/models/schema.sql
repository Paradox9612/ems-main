-- Database schema for Employee Management System (SQLite)

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees table (extends users for additional info)
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  phone TEXT,
  position TEXT,
  department TEXT,
  hireDate DATE,
  salary REAL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  check_in TIME,
  check_out TIME,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Leave applications table
CREATE TABLE IF NOT EXISTS leave_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Salary records table
CREATE TABLE IF NOT EXISTS salaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  amount REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  base_salary REAL NOT NULL,
  incentives REAL DEFAULT 0,
  deductions REAL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  document_type TEXT,
  file_path TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Leave applications table
CREATE TABLE IF NOT EXISTS leave_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  leave_type TEXT NOT NULL,
  department TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
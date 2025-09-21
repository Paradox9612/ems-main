# Employee Management System (EMS)

A comprehensive web-based Employee Management System built with React (frontend) and Node.js/Express (backend) with SQLite database. The system provides admin and employee interfaces for managing employees, attendance, salaries, leaves, documents, and dashboard analytics.

## 🚀 Features

### Admin Features
- **Dashboard**: Real-time statistics and analytics
  - Total employees count
  - Present today count
  - Total salary paid
  - Documents uploaded
  - Attendance rate
  - Average salary
  - Approved/pending leaves
  - Interactive charts (attendance overview, salary distribution, leave status)

- **Employee Management**:
  - Add, edit, delete employees
  - Quick salary updates
  - View employee details (position, department, contact info)
  - Role-based access control

- **Attendance Management**:
  - View today's attendance
  - Clock in/out functionality
  - Attendance history
  - Daily attendance reports

- **Salary Management**:
  - Create salary records with base salary, incentives, deductions
  - Mark salaries as paid/pending
  - Salary history and statistics
  - Monthly salary processing

- **Leave Management**:
  - Approve/reject leave applications
  - View leave statistics
  - Leave application workflow

- **Document Management**:
  - Upload employee documents (PDF only)
  - Download/view documents
  - Document categorization
  - File size and upload date tracking

### Employee Features
- **Personal Dashboard**: Overview of personal information
- **Attendance**: Clock in/out, view attendance history
- **Salary**: View salary history and details
- **Leaves**: Apply for leave, view leave status
- **Documents**: Upload and manage personal documents

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Framer Motion** for animations
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📁 Project Structure

```
ems-project/
├── backend/                    # Backend API server
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── salaryController.js
│   │   ├── leaveController.js
│   │   ├── documentController.js
│   │   └── dashboardController.js
│   ├── middlewares/
│   │   └── authMiddleware.js   # Authentication middleware
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   └── schema.sql         # Database schema
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── salaryRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── documentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/               # File upload directory
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env                   # Environment variables
├── EMS-main/                  # Frontend React app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Dashboard (Admin Only)
- `GET /api/dashboard/stats` - Get dashboard statistics

### Employees
- `GET /api/employees` - Get all employees (admin)
- `POST /api/employees` - Create new employee (admin)
- `GET /api/employees/:id` - Get employee by ID (admin)
- `PUT /api/employees/:id` - Update employee (admin)
- `DELETE /api/employees/:id` - Delete employee (admin)

### Attendance
- `POST /api/attendance/clockin` - Clock in
- `POST /api/attendance/clockout` - Clock out
- `GET /api/attendance/today` - Get today's attendance (admin)
- `GET /api/attendance` - Get employee's attendance history
- `GET /api/attendance/stats` - Get attendance statistics (admin)
- `GET /api/attendance/:date` - Get attendance by date (admin)

### Salaries
- `GET /api/salaries` - Get all salaries (admin)
- `GET /api/salaries/employee/:id` - Get employee salaries (admin)
- `POST /api/salaries` - Create salary record (admin)
- `PUT /api/salaries/:id` - Update salary record (admin)
- `DELETE /api/salaries/:id` - Delete salary record (admin)
- `GET /api/salaries/stats` - Get salary statistics (admin)
- `GET /api/salaries/my` - Get current user's salaries

### Leaves
- `GET /api/leaves` - Get all leaves (admin) / employee leaves
- `POST /api/leaves` - Create leave application
- `PUT /api/leaves/:id/status` - Update leave status (admin)
- `DELETE /api/leaves/:id` - Delete leave application
- `GET /api/leaves/stats` - Get leave statistics (admin)

### Documents
- `GET /api/documents` - Get all documents (admin) / employee documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/download/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Health Check
- `GET /api/health` - Server health check

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ems-project
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env

   # Edit .env file with your configuration
   nano .env

   # Initialize database (runs automatically on first start)
   # The schema.sql will be executed automatically
   ```

3. **Frontend Setup**
   ```bash
   cd ../EMS-main

   # Install dependencies
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
DB_PATH=./ems.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5001`

2. **Start Frontend (in new terminal)**
   ```bash
   cd EMS-main
   npm run dev
   ```
   Frontend will run on `http://localhost:5174`

3. **Access the Application**
   - Open browser and go to `http://localhost:5174`
   - Default admin credentials:
     - Email: `admin@company.com`
     - Password: `admin123`

## 🔄 Application Flow

### User Registration/Login
1. User registers or logs in through frontend
2. JWT token is generated and stored in localStorage
3. Token is sent with all subsequent API requests

### Admin Dashboard
1. Admin logs in and accesses dashboard
2. Dashboard fetches real-time statistics from `/api/dashboard/stats`
3. Statistics include counts from employees, attendance, salaries, documents, leaves tables
4. Charts display attendance overview, salary distribution, leave status

### Employee Management
1. Admin can view all employees via `/api/employees`
2. Add new employee: Creates user account + employee record + initial salary record
3. Edit employee: Updates employee details + creates/updates salary record
4. Delete employee: Removes from all related tables

### Attendance System
1. Employees clock in/out through frontend
2. Records stored with timestamps
3. Admin can view attendance reports and statistics

### Salary Management
1. Admin creates salary records with base salary, incentives, deductions
2. System calculates total amount automatically
3. Salaries can be marked as paid/pending
4. Employees can view their salary history

### Leave Management
1. Employees apply for leave through frontend
2. Admin approves/rejects applications
3. Leave statistics tracked and displayed

### Document Management
1. Employees upload PDF documents
2. Files stored in `backend/uploads/` directory
3. Admin can view/download all documents
4. Employees can manage their own documents

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users**: User accounts with authentication
- **employees**: Employee details (extends users)
- **attendance**: Daily attendance records
- **salaries**: Monthly salary records with breakdowns
- **leave_applications**: Leave requests and approvals
- **documents**: File uploads with metadata

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: Admin vs Employee permissions
- **File Upload Validation**: PDF only, size limits
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for frontend-backend communication

## 📊 Default Data

The application comes with sample data:
- Admin user: `admin@company.com` / `admin123`
- Sample employees with various roles and departments
- Sample attendance, salary, and leave records

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ems-backend"
   ```

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the `dist` folder with any static server (nginx, Apache, etc.)

### Environment Variables for Production
```env
PORT=5001
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
DB_PATH=/path/to/production/db/ems.db
UPLOAD_PATH=/path/to/production/uploads
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   netstat -ano | findstr :5001
   # Kill process
   taskkill /PID <PID> /F
   ```

2. **Database connection issues**
   - Ensure SQLite database file exists
   - Check file permissions
   - Verify DB_PATH in .env

3. **File upload issues**
   - Ensure uploads directory exists and is writable
   - Check file size limits
   - Verify multer configuration

4. **CORS errors**
   - Check if backend CORS is configured for frontend URL
   - Verify API_BASE_URL in frontend

### Database Reset
```bash
cd backend
rm ems.db
npm start  # Will recreate database from schema.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Updates & Maintenance

- Regularly update dependencies
- Monitor database performance
- Backup database files
- Review and update security measures
- Test all features after updates

---

**Note**: This is a full-stack web application designed for employee management in small to medium-sized organizations. Ensure proper security measures are implemented before deploying to production environments.
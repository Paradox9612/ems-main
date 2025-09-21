const db = require('../config/db');
const Attendance = require('../models/Attendance');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total Employees (active)
    const totalEmployees = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM employees WHERE status = 'active'",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    // Present Today and Attendance Rate
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = await Attendance.getTodayStats();
    const presentToday = attendanceStats.present;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    // Total Salary Paid
    const totalSalaryPaid = await new Promise((resolve, reject) => {
      db.get(
        "SELECT SUM(amount) as total FROM salaries WHERE status = 'paid'",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    // Documents Count
    const documentsCount = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM documents",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    // Average Salary
    const avgSalary = await new Promise((resolve, reject) => {
      db.get(
        "SELECT AVG(salary) as average FROM employees WHERE status = 'active' AND salary IS NOT NULL",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.average || 0);
        }
      );
    });

    // Leave Stats
    const leaveStats = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending FROM leave_applications",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve({ approved: row.approved || 0, pending: row.pending || 0 });
        }
      );
    });

    const stats = {
      totalEmployees,
      presentToday,
      totalSalaryPaid: parseFloat(totalSalaryPaid),
      documentsUploaded: documentsCount,
      attendanceRate,
      avgSalary: parseFloat(avgSalary),
      approvedLeaves: leaveStats.approved,
      pendingLeaves: leaveStats.pending,
      // For charts
      attendanceOverview: {
        present: presentToday,
        absent: attendanceStats.total - presentToday
      },
      salaryDistribution: {
        totalPaid: parseFloat(totalSalaryPaid),
        avgSalary: parseFloat(avgSalary)
      },
      leaveStatus: {
        approved: leaveStats.approved,
        pending: leaveStats.pending
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
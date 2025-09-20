const db = require('../config/db');

class Attendance {
  static getByEmployeeAndDate(employeeId, date) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employeeId, date],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static getByEmployee(employeeId, limit = 30) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT ?',
        [employeeId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static getAllByDate(date) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT a.*, u.firstName, u.lastName FROM attendance a JOIN employees e ON a.employee_id = e.id JOIN users u ON e.user_id = u.id WHERE a.date = ? ORDER BY a.check_in',
        [date],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static getTodayStats() {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];

      // Get all attendance records for today
      db.all(
        'SELECT a.*, u.firstName, u.lastName FROM attendance a JOIN employees e ON a.employee_id = e.id JOIN users u ON e.user_id = u.id WHERE a.date = ?',
        [today],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          // Get total employees count
          db.get(
            'SELECT COUNT(*) as total FROM users WHERE role = "employee"',
            [],
            (err2, totalRow) => {
              if (err2) {
                reject(err2);
                return;
              }

              const present = rows.filter(r => r.status === 'present' || r.status === 'late').length;
              const absent = totalRow.total - present;
              const clockedIn = rows.filter(r => !r.clock_out).length;

              resolve({
                present,
                absent,
                clockedIn,
                total: totalRow.total,
                records: rows
              });
            }
          );
        }
      );
    });
  }

  static clockIn(employeeId, date, checkIn, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
        [employeeId, date, checkIn, status],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static clockOut(attendanceId, checkOut) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE attendance SET clock_out = ? WHERE id = ?',
        [checkOut, attendanceId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM attendance WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = Attendance;
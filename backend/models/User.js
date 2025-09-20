const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, firstName, lastName, email, password, role FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, firstName, lastName, email, role FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { firstName, lastName, email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [firstName, lastName, email, hashedPassword, role],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, firstName, lastName, email, role });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
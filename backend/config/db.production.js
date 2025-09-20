const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST_PROD || 'production-host',
  user: process.env.DB_USER_PROD || 'prod-user',
  password: process.env.DB_PASSWORD_PROD || 'prod-password',
  database: process.env.DB_NAME_PROD || 'ems_prod_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool.promise();
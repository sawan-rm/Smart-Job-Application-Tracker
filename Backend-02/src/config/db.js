const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sawan@123',
  database: 'job_tracker',
});

// Convert to promise pool
const promisePool = pool.promise();

// Test the connection
(async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Database connected ✅');
    connection.release();
  } catch (err) {
    console.error('DB connection failed ❌', err);
  }
})();

module.exports = promisePool;

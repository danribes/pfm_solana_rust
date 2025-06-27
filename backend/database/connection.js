const { Pool } = require('pg');
const config = require('../config/database');

let pool;

function createPool() {
  return new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: config.max,
    min: config.min,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    application_name: config.application_name,
  });
}

function connectWithRetry(retries = 5, delay = 2000) {
  return new Promise((resolve, reject) => {
    function attempt(n) {
      pool = createPool();
      pool.connect()
        .then(client => {
          client.release();
          resolve(pool);
        })
        .catch(err => {
          if (n > 0) {
            setTimeout(() => attempt(n - 1), delay);
          } else {
            reject(err);
          }
        });
    }
    attempt(retries);
  });
}

async function healthCheck() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getPool: () => pool,
  connectWithRetry,
  healthCheck,
}; 
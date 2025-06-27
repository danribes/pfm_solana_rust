const { connectWithRetry } = require('./connection');

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = connectWithRetry();
  }
  return poolPromise;
}

module.exports = getPool; 
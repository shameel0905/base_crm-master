const path = require('path');
const pool = require(path.join(__dirname, '..', 'DB_Config'));

// Simple wrapper exposing query and pool for other modules
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

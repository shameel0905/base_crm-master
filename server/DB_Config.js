// connection with postgreSQL database
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from server/.env and repo root .env (if present)
dotenv.config({ path: './.env' });
dotenv.config({ path: '../.env' });

const poolConfig = {};

// Accept DATABASE_URL (preferred) or individual env vars
if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
} else {
    if (process.env.DB_USER) poolConfig.user = process.env.DB_USER;
    if (process.env.DB_HOST) poolConfig.host = process.env.DB_HOST;
    if (process.env.DB_NAME) poolConfig.database = process.env.DB_NAME;
    if (process.env.DB_PASSWORD) poolConfig.password = String(process.env.DB_PASSWORD);
    if (process.env.DB_PORT) poolConfig.port = parseInt(process.env.DB_PORT, 10);
}

// Optional SSL
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    poolConfig.ssl = {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
}

const pool = new Pool(poolConfig);

module.exports = pool;
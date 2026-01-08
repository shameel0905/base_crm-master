const fs = require('fs');
const path = require('path');
const pool = require('../DB_Config');

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function run() {
  const out = [];
  const start = Date.now();
  try {
    out.push('DB Connection Test - ' + new Date().toISOString());

    // Postgres version
    const v = await pool.query('SELECT version()');
    out.push('Postgres Version: ' + (v.rows[0] ? Object.values(v.rows[0]).join(' ') : JSON.stringify(v.rows)));

    // Current database
    const db = await pool.query('SELECT current_database()');
    out.push('Current Database: ' + (db.rows[0] ? Object.values(db.rows[0]).join(' ') : JSON.stringify(db.rows)));

    // List public tables
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    out.push('Public Tables (' + tables.rowCount + '):');
    tables.rows.forEach(r => out.push(' - ' + r.table_name));

    // Sample counts for common tables
    const sampleTables = ['customers', 'orders', 'products'];
    for (const t of sampleTables) {
      try {
        const res = await pool.query(`SELECT COUNT(*)::text AS cnt FROM ${t}`);
        out.push(`Table ${t} count: ${res.rows[0].cnt}`);
      } catch (err) {
        out.push(`Table ${t} check failed: ${err.message}`);
      }
    }

    const duration = (Date.now() - start) / 1000;
    out.push('Duration(s): ' + duration.toFixed(2));

    // Save to reports
    const reportsDir = path.resolve(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const filename = path.join(reportsDir, `db-connection-${timestamp()}.txt`);
    fs.writeFileSync(filename, out.join('\n'));
    console.log('Wrote DB connection report to', filename);
  } catch (err) {
    console.error('DB connection test failed:', err.message);
    const reportsDir = path.resolve(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const filename = path.join(reportsDir, `db-connection-${timestamp()}-error.txt`);
    fs.writeFileSync(filename, `ERROR: ${err.stack}`);
    console.log('Wrote error report to', filename);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (e) { /* ignore */ }
  }
}

if (require.main === module) run();

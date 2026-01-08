#!/usr/bin/env node
/**
 * fetch_all_orders.js (CommonJS)
 *
 * Same functionality as before but written to work as a CommonJS script so it can be
 * executed with `node fetch_all_orders.js` without setting "type": "module".
 */

const fs = require('fs');
const path = require('path');

// Attempt to load a .env file automatically (if dotenv is installed).
// This lets you keep WC_STORE and keys in a .env file at the project root and
// run the script without manually exporting variables.
try {
  // prefer project-level .env (server/.env)
  const dotenvPath = path.resolve(__dirname, '..', '.env');
  // Only require dotenv if it's installed; otherwise silently continue.
  // eslint-disable-next-line global-require
  const dotenv = require('dotenv');
  dotenv.config({ path: dotenvPath });
} catch (e) {
  // ignore if dotenv isn't installed
}

const argv = process.argv.slice(2);
const outputJSON = argv.includes('--json') || argv.includes('-j');

const STORE = process.env.WC_STORE;
const KEY = process.env.WC_CONSUMER_KEY;
const SECRET = process.env.WC_CONSUMER_SECRET;

if (!STORE || !KEY || !SECRET) {
  console.error('Missing required environment variables. Please set WC_STORE, WC_CONSUMER_KEY, WC_CONSUMER_SECRET');
  process.exit(2);
}

const API_BASE = `${STORE.replace(/\/$/, '')}/wp-json/wc/v3`;

function buildAuthUrl(url) {
  const u = new URL(url);
  u.searchParams.set('consumer_key', KEY);
  u.searchParams.set('consumer_secret', SECRET);
  return u.toString();
}

async function getFetch() {
  if (global.fetch) return global.fetch.bind(global);
  // Try dynamic import first (works with node-fetch v3 if installed as ESM)
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (err) {
    // Fallback to require (works for node-fetch v2)
    try {
      return require('node-fetch');
    } catch (err2) {
      console.error('fetch is not available. Please run on Node 18+ or install node-fetch (v2 or v3).');
      process.exit(1);
    }
  }
}

async function fetchOrdersPage(fetchFn, page = 1, per_page = 100) {
  const url = buildAuthUrl(`${API_BASE}/orders?page=${page}&per_page=${per_page}`);
  const res = await fetchFn(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  const data = await res.json();
  const total = res.headers.get('x-wp-total');
  const totalPages = res.headers.get('x-wp-totalpages');
  return { data, total: total ? Number(total) : undefined, totalPages: totalPages ? Number(totalPages) : undefined };
}

function transformOrder(o) {
  const billing = o.billing || {};
  const date_paid = o.date_paid || null;
  const paymentStatus = date_paid ? 'Paid' : 'Unpaid';
  return {
    id: o.id,
    number: o.number || o.id,
    status: o.status,
    total: o.total,
    currency: o.currency,
    date_created: o.date_created,
    date_paid,
    paymentStatus,
    customer: `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || (billing.company || 'No Customer'),
    billing_email: billing.email || '',
  };
}

function printTable(orders) {
  const rows = orders.map(transformOrder);
  const headers = ['ID', 'Number', 'Status', 'Total', 'Paid', 'Date Paid', 'Customer', 'Email'];
  const cols = [
    rows.map(r => String(r.id)),
    rows.map(r => String(r.number)),
    rows.map(r => String(r.status)),
    rows.map(r => `${r.currency || ''} ${r.total || '0'}`),
    rows.map(r => r.paymentStatus),
    rows.map(r => r.date_paid || ''),
    rows.map(r => r.customer),
    rows.map(r => r.billing_email),
  ];

  const colWidths = cols.map((c, i) => Math.max(headers[i].length, ...c.map(v => v.length)));

  const sep = (w) => '-'.repeat(w + 2);
  const lineSep = '+' + colWidths.map(w => sep(w)).join('+') + '+';

  function pad(s, w) { return ' ' + s + ' '.repeat(w - s.length + 1); }

  console.log(lineSep);
  console.log('|' + headers.map((h, i) => pad(h, colWidths[i])).join('|') + '|');
  console.log(lineSep);
  rows.forEach(r => {
    const cells = [String(r.id), String(r.number), String(r.status), `${r.currency || ''} ${r.total || '0'}`, r.paymentStatus, r.date_paid || '', r.customer, r.billing_email];
    console.log('|' + cells.map((c, i) => pad(c, colWidths[i])).join('|') + '|');
  });
  console.log(lineSep);
}

(async () => {
  const fetchFn = await getFetch();
  try {
    const per_page = 100;
    let page = 1;
    let allOrders = [];
    while (true) {
      const { data, total, totalPages } = await fetchOrdersPage(fetchFn, page, per_page);
      if (!Array.isArray(data)) {
        console.error('Unexpected response format, expected array of orders');
        console.log(data);
        process.exit(3);
      }
      allOrders = allOrders.concat(data);
      console.error(`Fetched page ${page}${totalPages ? ` of ${totalPages}` : ''} (${data.length} orders) ...`);
      if (totalPages && page >= totalPages) break;
      if (!totalPages && data.length < per_page) break;
      page += 1;
    }

    if (outputJSON) {
      console.log(JSON.stringify(allOrders, null, 2));
      process.exit(0);
    }

    if (allOrders.length === 0) {
      console.log('No orders found');
      process.exit(0);
    }

    printTable(allOrders);
    console.log(`\nTotal orders fetched: ${allOrders.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error fetching orders:', err.message || err);
    process.exit(4);
  }
})();

const express = require('express');
const cors = require('cors');
const { spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

// load .env from project root if present
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Initialize Express app
const app = express();

const PORT = process.env.PORT || 3001;
const exportsDir = path.resolve(__dirname, '..', 'exports');
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || null;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
// Increase payload limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ensure exports directory exists
if (!fs.existsSync(exportsDir)) {
  try { fs.mkdirSync(exportsDir, { recursive: true }); } catch (e) { /* ignore */ }
}

if (!BACKEND_API_KEY) {
  console.warn('WARNING: BACKEND_API_KEY not set — sync endpoints will be unprotected. Set BACKEND_API_KEY in env to enable API key protection.');
}

// Import routes
const woocommerceRoutes = require('./routes/woocommerce');
const shopifyRoutes = require('./routes/shopify');
const uploadRoutes = require('./routes/upload');

// Mount routes
app.use('/api/woocommerce', woocommerceRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/upload', uploadRoutes);

function runScript(cmd, args = [], envVars = {}) {
  return new Promise((resolve, reject) => {
    const env = Object.assign({}, process.env, envVars);
    const child = spawn(cmd, args, { env, shell: true });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve({ out, err }); else reject({ code, out, err });
    });
  });
}

function sendFile(res, filePath, downloadName) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.status(404).send('File not found');
      return;
    }
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// helper to validate api key for protected routes
function isAuthorized(req) {
  if (!BACKEND_API_KEY) return true; // allow if no key configured (for dev)
  const headerKey = req.headers['x-api-key'];
  if (headerKey && headerKey === BACKEND_API_KEY) return true;
  const auth = req.headers['authorization'];
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token === BACKEND_API_KEY) return true;
  }
  return false;
}

// Legacy HTTP endpoints (keeping for backward compatibility)
app.get('/export/shopify', async (req, res) => {
  try {
    await runScript('node', ['scripts/export_shopify.js']);
    const f = path.join(exportsDir, 'shopify_products.csv');
    sendFile(res, f, 'shopify_products.csv');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/export/woocommerce', async (req, res) => {
  try {
    await runScript('node', ['scripts/export_woocommerce.js']);
    const f = path.join(exportsDir, 'woocommerce_products.csv');
    sendFile(res, f, 'woocommerce_products.csv');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync endpoints (protected)
app.post('/sync/shopify', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized - missing or invalid API key' });
  }

  const payload = req.body || {};
  const flags = [];
  if (payload.dry) flags.push('--dry');
  if (payload.batchSize) flags.push(`--batch-size=${payload.batchSize}`);
  if (payload.retries) flags.push(`--retries=${payload.retries}`);
  
  const env = {};
  if (payload.shop) env.SHOPIFY_STORE = payload.shop;
  if (payload.token) env.SHOPIFY_TOKEN = payload.token;

  try {
    const result = await runScript('node', ['scripts/sync_shopify.js', ...flags], env);
    res.json({ success: true, out: result.out, err: result.err });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

app.post('/sync/woocommerce', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized - missing or invalid API key' });
  }

  const payload = req.body || {};
  const flags = [];
  if (payload.dry) flags.push('--dry');
  if (payload.batchSize) flags.push(`--batch-size=${payload.batchSize}`);
  if (payload.retries) flags.push(`--retries=${payload.retries}`);
  
  const env = {};
  if (payload.store) env.WC_STORE = payload.store;
  if (payload.key) env.WC_CONSUMER_KEY = payload.key;
  if (payload.secret) env.WC_CONSUMER_SECRET = payload.secret;

  try {
    const result = await runScript('node', ['scripts/sync_woocommerce.js', ...flags], env);
    res.json({ success: true, out: result.out, err: result.err });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Base CRM Backend API',
    version: '1.0.0',
    endpoints: {
      woocommerce: {
        test: 'GET /api/woocommerce/test',
        products: 'GET /api/woocommerce/products',
        product: 'GET /api/woocommerce/products/:id',
        orders: 'GET /api/woocommerce/orders',
        customers: 'GET /api/woocommerce/customers',
      },
      legacy: {
        exportShopify: 'GET /export/shopify',
        exportWooCommerce: 'GET /export/woocommerce',
        syncShopify: 'POST /sync/shopify',
        syncWooCommerce: 'POST /sync/woocommerce',
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend server listening on http://localhost:${PORT}`);
  console.log(`✓ WooCommerce API: http://localhost:${PORT}/api/woocommerce`);
});

app.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Choose a different PORT or stop the process using it.`);
  } else {
    console.error('Server error', err);
  }
  process.exit(1);
});

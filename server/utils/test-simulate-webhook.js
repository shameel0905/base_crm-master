#!/usr/bin/env node
const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    const payload = { topic: 'products/update', payload: { id: 1, message: 'Simulated update test' } };
    console.log('Posting simulate webhook to /api/shopify/simulate with payload:', payload);
    const res = await makeRequest('POST', '/api/shopify/simulate', payload);
    console.log('Response:', res.status, JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();

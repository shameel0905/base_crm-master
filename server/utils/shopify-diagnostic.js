#!/usr/bin/env node
/**
 * Shopify API Diagnostic Tool
 * This helps verify store URL and credentials
 */

const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION;

console.log('=== Shopify Configuration ===');
console.log(`Store: ${STORE}`);
console.log(`API Version: ${API_VERSION}`);
console.log(`Access Token: ${TOKEN ? '***' + TOKEN.slice(-8) : 'NOT SET'}`);

if (!STORE || !TOKEN) {
  console.error('\n❌ Missing SHOPIFY_STORE or SHOPIFY_ACCESS_TOKEN');
  process.exit(1);
}

// Test various endpoints to identify the issue
async function testEndpoints() {
  const endpoints = [
    '/admin/api.json', // Test basic auth
    `/admin/api/${API_VERSION}/shop.json`, // Get shop info
    `/admin/api/${API_VERSION}/products.json?limit=1`, // Get products
  ];

  console.log('\n=== Testing Endpoints ===\n');

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: STORE,
      path: endpoint,
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
      },
    };

    console.log(`Testing: GET ${endpoint}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const indicator = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
        console.log(`  ${indicator} Status: ${status}`);
        
        if (status === 401) {
          console.log('  Error: Invalid Access Token');
        } else if (status === 404) {
          console.log('  Error: Endpoint not found');
        } else if (status === 200) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.shop) {
              console.log(`  Shop: ${parsed.shop.name} (${parsed.shop.domain})`);
            }
          } catch (e) {}
        }
        console.log();
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`  ❌ Error: ${err.message}\n`);
      resolve();
    });

    req.end();
  });
}

testEndpoints();

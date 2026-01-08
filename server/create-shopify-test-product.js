#!/usr/bin/env node

/**
 * Create a persistent Shopify test product via server API
 * Usage: node create-shopify-test-product.js
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, parseError: e.message });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

(async function main() {
  try {
    console.log('Creating a persistent Shopify test product...');

    const payload = {
      title: 'Persistent Test Product',
      description: '<p>Created by create-shopify-test-product.js</p>',
      vendor: 'Automated Test',
      product_type: 'Test Item',
      images: [{ src: 'https://via.placeholder.com/600x600?text=Persistent+Test' }],
      variants: [
        { price: '12.99', sku: 'PERSIST-001', inventory_quantity: 50, available: true }
      ]
    };

    const createRes = await makeRequest('POST', '/api/shopify/products', payload);
    console.log('Create response status:', createRes.status);
    console.log(JSON.stringify(createRes.data, null, 2));

    if (createRes.status === 201 && createRes.data?.success) {
      const id = createRes.data.data?.id;
      console.log('\n✅ Created product with ID:', id);

      // Verify by fetching the single product
      const readRes = await makeRequest('GET', `/api/shopify/products/${id}`);
      console.log('\nGET product response status:', readRes.status);
      console.log(JSON.stringify(readRes.data, null, 2));

      // Also check it appears in the list
      const listRes = await makeRequest('GET', '/api/shopify/products?limit=50');
      console.log('\nList response status:', listRes.status);
      if (listRes.data?.success) {
        const found = listRes.data.data?.find(p => p.id === id);
        console.log(found ? '\n✅ Product found in product list.' : '\n⚠️ Product not found in list (unexpected).');
      }

      process.exit(0);
    } else {
      console.error('\n❌ Failed to create product. See response above.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
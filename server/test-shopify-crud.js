#!/usr/bin/env node

/**
 * Shopify CRUD Operations Test Script
 * Tests Create, Read, Update, Delete operations on Shopify products
 * 
 * Usage: node test-shopify-crud.js
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        error: error.message,
        code: error.code
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Shopify Product CRUD Operations Test Suite                   ║');
  console.log('║  Testing: Create, Read, Update, Delete                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let productId = null;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Create Product
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: CREATE Product');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const createPayload = {
    title: 'Test Product - CRUD Operations',
    description: '<p>This is a test product created via CRUD test suite.</p>',
    vendor: 'Test Store',
    product_type: 'T-Shirt',
    images: [
      {
        src: 'https://via.placeholder.com/500x500?text=Test+Product'
      }
    ],
    variants: [
      {
        price: '29.99',
        sku: 'TEST-CRUD-001',
        inventory_quantity: 100,
        available: true
      }
    ]
  };

  console.log('📤 Request Method: POST');
  console.log('📍 Endpoint: /api/shopify/products');
  console.log('📦 Payload:', JSON.stringify(createPayload, null, 2));
  
  const createRes = await makeRequest('POST', '/api/shopify/products', createPayload);
  
  console.log('\n📥 Response Status:', createRes.status);
  
  if (createRes.error) {
    console.log('❌ ERROR:', createRes.error);
    testsFailed++;
  } else if (createRes.status === 201 && createRes.data?.success) {
    console.log('✅ SUCCESS - Product created!');
    productId = createRes.data.data?.id;
    console.log('📌 Product ID:', productId);
    console.log('📋 Response:', JSON.stringify(createRes.data, null, 2).split('\n').slice(0, 10).join('\n') + '\n   ...');
    testsPassed++;
  } else {
    console.log('❌ FAILED');
    console.log('Response:', JSON.stringify(createRes.data, null, 2));
    testsFailed++;
  }

  if (!productId) {
    console.log('\n⚠️  Cannot continue - Product ID not obtained. Aborting remaining tests.');
    process.exit(1);
  }

  // Test 2: Read Product
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: READ Product');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📤 Request Method: GET');
  console.log(`📍 Endpoint: /api/shopify/products/${productId}`);
  
  const readRes = await makeRequest('GET', `/api/shopify/products/${productId}`);
  
  console.log('\n📥 Response Status:', readRes.status);
  
  if (readRes.error) {
    console.log('❌ ERROR:', readRes.error);
    testsFailed++;
  } else if (readRes.status === 200 && readRes.data?.success) {
    console.log('✅ SUCCESS - Product retrieved!');
    console.log('📦 Product Details:');
    console.log('   - Name:', readRes.data.data?.name);
    console.log('   - SKU:', readRes.data.data?.sku);
    console.log('   - Price:', readRes.data.data?.price);
    console.log('   - Status:', readRes.data.data?.status);
    testsPassed++;
  } else {
    console.log('❌ FAILED');
    console.log('Response:', JSON.stringify(readRes.data, null, 2));
    testsFailed++;
  }

  // Test 3: Update Product
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: UPDATE Product');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const updatePayload = {
    title: 'Test Product - UPDATED VIA CRUD',
    description: '<p>This product has been updated via CRUD test.</p><p>Updated at: ' + new Date().toISOString() + '</p>'
  };

  console.log('📤 Request Method: PUT');
  console.log(`📍 Endpoint: /api/shopify/products/${productId}`);
  console.log('📦 Update Payload:', JSON.stringify(updatePayload, null, 2));
  
  const updateRes = await makeRequest('PUT', `/api/shopify/products/${productId}`, updatePayload);
  
  console.log('\n📥 Response Status:', updateRes.status);
  
  if (updateRes.error) {
    console.log('❌ ERROR:', updateRes.error);
    testsFailed++;
  } else if (updateRes.status === 200 && updateRes.data?.success) {
    console.log('✅ SUCCESS - Product updated!');
    console.log('📋 Updated fields:');
    console.log('   - Title:', updateRes.data.data?.title);
    testsPassed++;
  } else {
    console.log('❌ FAILED');
    console.log('Response:', JSON.stringify(updateRes.data, null, 2));
    testsFailed++;
  }

  // Test 4: Get All Products (to verify update)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: LIST All Products');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📤 Request Method: GET');
  console.log('📍 Endpoint: /api/shopify/products?limit=50');
  
  const listRes = await makeRequest('GET', '/api/shopify/products?limit=50');
  
  console.log('\n📥 Response Status:', listRes.status);
  
  if (listRes.error) {
    console.log('❌ ERROR:', listRes.error);
    testsFailed++;
  } else if (listRes.status === 200 && listRes.data?.success) {
    console.log('✅ SUCCESS - Products listed!');
    console.log(`📦 Total Products: ${listRes.data.count}`);
    
    const testProduct = listRes.data.data?.find(p => p.id === parseInt(productId));
    if (testProduct) {
      console.log('✓ Created product found in list');
      console.log('  Title:', testProduct.name);
    } else {
      console.log('⚠️  Created product not found in list');
    }
    testsPassed++;
  } else {
    console.log('❌ FAILED');
    console.log('Response:', JSON.stringify(listRes.data, null, 2));
    testsFailed++;
  }

  // Test 5: Delete Product
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: DELETE Product');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📤 Request Method: DELETE');
  console.log(`📍 Endpoint: /api/shopify/products/${productId}`);
  
  const deleteRes = await makeRequest('DELETE', `/api/shopify/products/${productId}`);
  
  console.log('\n📥 Response Status:', deleteRes.status);
  
  if (deleteRes.error) {
    console.log('❌ ERROR:', deleteRes.error);
    testsFailed++;
  } else if (deleteRes.status === 200 && deleteRes.data?.success) {
    console.log('✅ SUCCESS - Product deleted!');
    testsPassed++;
  } else {
    console.log('❌ FAILED');
    console.log('Response:', JSON.stringify(deleteRes.data, null, 2));
    testsFailed++;
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Shopify CRUD operations are working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs.\n');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

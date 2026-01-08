#!/usr/bin/env node
/**
 * Test Shopify API Connection
 * Usage: node utils/test-shopify-connection.js
 */

const shopifyAPI = require('../shopify_api');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function testConnection() {
  console.log('🔍 Testing Shopify API Connection...\n');
  
  try {
    // Test 1: Fetch products
    console.log('Test 1: Fetching products...');
    const products = await shopifyAPI.getProducts({ limit: 5 });
    console.log(`✅ Successfully fetched ${products.length} products`);
    if (products.length > 0) {
      console.log(`   First product: "${products[0].title}"`);
    }
    
    // Test 2: Fetch orders
    console.log('\nTest 2: Fetching orders...');
    const orders = await shopifyAPI.getOrders({ limit: 5 });
    console.log(`✅ Successfully fetched ${orders.length} orders`);
    if (orders.length > 0) {
      console.log(`   First order: #${orders[0].order_number} (${orders[0].email})`);
    }
    
    // Test 3: Fetch customers
    console.log('\nTest 3: Fetching customers...');
    const customers = await shopifyAPI.getCustomers({ limit: 5 });
    console.log(`✅ Successfully fetched ${customers.length} customers`);
    if (customers.length > 0) {
      console.log(`   First customer: ${customers[0].first_name} ${customers[0].last_name} (${customers[0].email})`);
    }
    
    console.log('\n✅ All tests passed! Shopify connection is working correctly.\n');
    
    // Print summary
    console.log('=== Summary ===');
    console.log(`Store: ${process.env.SHOPIFY_STORE}`);
    console.log(`Products: ${products.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Customers: ${customers.length}`);
    
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    if (error.data) {
      console.error('API Response:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

testConnection();

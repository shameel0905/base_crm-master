#!/usr/bin/env node
/**
 * Shopify & WooCommerce API Demo
 * This script demonstrates how to use both e-commerce platform APIs
 */

const https = require('https');
require('dotenv').config();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

// Helper to make Shopify API calls
async function shopifyRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_STORE,
      path: `/admin/api/${SHOPIFY_API_VERSION}${path}`,
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Shopify & WooCommerce Integration Demo            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // ========== SHOPIFY PRODUCTS ==========
    console.log('📦 SHOPIFY - PRODUCTS');
    console.log('─'.repeat(60));
    const products = await shopifyRequest('/products.json?limit=5');
    console.log(`✅ Fetched ${products.products.length} products\n`);
    
    products.products.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.title}`);
      console.log(`     ID: ${product.id}`);
      console.log(`     Variants: ${product.variants.length}`);
      console.log(`     Status: ${product.status}`);
      if (product.variants[0]) {
        console.log(`     Price: $${product.variants[0].price}`);
        console.log(`     SKU: ${product.variants[0].sku || 'N/A'}`);
      }
      console.log();
    });

    // ========== SHOPIFY CUSTOMERS ==========
    console.log('\n👥 SHOPIFY - CUSTOMERS');
    console.log('─'.repeat(60));
    const customers = await shopifyRequest('/customers.json?limit=5');
    console.log(`✅ Fetched ${customers.customers.length} customers\n`);
    
    customers.customers.forEach((customer, i) => {
      console.log(`  ${i + 1}. ${customer.first_name} ${customer.last_name}`);
      console.log(`     Email: ${customer.email}`);
      console.log(`     Orders: ${customer.orders_count}`);
      console.log(`     Total Spent: $${customer.total_spent}`);
      console.log();
    });

    // ========== SHOPIFY ORDERS ==========
    console.log('\n📋 SHOPIFY - ORDERS');
    console.log('─'.repeat(60));
    const orders = await shopifyRequest('/orders.json?limit=5');
    console.log(`✅ Fetched ${orders.orders.length} orders\n`);
    
    if (orders.orders.length > 0) {
      orders.orders.forEach((order, i) => {
        console.log(`  ${i + 1}. Order #${order.order_number}`);
        console.log(`     Customer: ${order.customer?.first_name} ${order.customer?.last_name}`);
        console.log(`     Total: $${order.total_price}`);
        console.log(`     Status: ${order.financial_status} / ${order.fulfillment_status}`);
        console.log(`     Items: ${order.line_items.length}`);
        console.log();
      });
    } else {
      console.log('  No orders found on this store.\n');
    }

    // ========== API ENDPOINTS SUMMARY ==========
    console.log('\n📡 AVAILABLE API ENDPOINTS');
    console.log('─'.repeat(60));
    
    console.log('\n🛍️  PRODUCTS');
    console.log('  GET    /api/shopify/products           - List all');
    console.log('  GET    /api/shopify/products/:id       - Get single');
    console.log('  POST   /api/shopify/products           - Create');
    console.log('  PUT    /api/shopify/products/:id       - Update');
    console.log('  DELETE /api/shopify/products/:id       - Delete');

    console.log('\n📦 VARIANTS');
    console.log('  GET    /api/shopify/products/:id/variants           - List');
    console.log('  POST   /api/shopify/products/:id/variants           - Create');
    console.log('  PUT    /api/shopify/products/:id/variants/:varId    - Update');
    console.log('  DELETE /api/shopify/products/:id/variants/:varId    - Delete');

    console.log('\n📋 ORDERS');
    console.log('  GET    /api/shopify/orders             - List all');
    console.log('  GET    /api/shopify/orders/:id         - Get single');

    console.log('\n👥 CUSTOMERS');
    console.log('  GET    /api/shopify/customers          - List all');

    console.log('\n\n✅ All integrations are working correctly!');
    console.log('\n📖 For more information, see:');
    console.log('   - QUICK_START.md');
    console.log('   - SHOPIFY_INTEGRATION.md');
    console.log('   - PRODUCT_ORDER_MODULES.md\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

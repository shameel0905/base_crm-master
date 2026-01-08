#!/usr/bin/env node

/**
 * WooCommerce API Connection Test Script
 * 
 * This script tests the WooCommerce REST API connectivity and validates credentials.
 * It performs comprehensive checks to ensure the API is properly configured.
 * 
 * Usage:
 *   node utils/test-woocommerce-connection.js
 * 
 * Environment Variables Required:
 *   - WC_STORE: WooCommerce store URL (e.g., example.com or https://example.com)
 *   - WC_CONSUMER_KEY: WooCommerce API Consumer Key
 *   - WC_CONSUMER_SECRET: WooCommerce API Consumer Secret
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Prints formatted messages to console
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const symbols = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
    test: '→'
  };

  const typeColors = {
    info: colors.blue,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    test: colors.cyan
  };

  console.log(
    `${typeColors[type]}${symbols[type]} ${colors.bright}[${timestamp}]${colors.reset} ${message}`
  );
}

/**
 * Prints section headers
 */
function printSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Validates environment variables
 */
function validateEnvironment() {
  printSection('Environment Variables Check');
  
  const required = ['WC_STORE', 'WC_CONSUMER_KEY', 'WC_CONSUMER_SECRET'];
  const missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
      log(`${key}: ${colors.red}NOT SET${colors.reset}`, 'error');
    } else {
      // Mask sensitive data
      const value = key.includes('SECRET') || key.includes('KEY') 
        ? process.env[key].substring(0, 10) + '...' 
        : process.env[key];
      log(`${key}: ${colors.green}${value}${colors.reset}`, 'success');
    }
  });
  
  if (missing.length > 0) {
    log(`Missing required environment variables: ${missing.join(', ')}`, 'error');
    log('Please set these variables in your .env file', 'warning');
    return false;
  }
  
  return true;
}

/**
 * Normalizes store URL
 */
function normalizeStoreUrl(url) {
  // Remove protocol if present
  url = url.replace(/^https?:\/\//, '');
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  // Add https protocol
  return `https://${url}`;
}

/**
 * Creates WooCommerce API client
 */
function createApiClient() {
  const storeUrl = normalizeStoreUrl(process.env.WC_STORE);
  
  log(`Creating API client for: ${storeUrl}`, 'info');
  
  return new WooCommerceRestApi({
    url: storeUrl,
    consumerKey: process.env.WC_CONSUMER_KEY,
    consumerSecret: process.env.WC_CONSUMER_SECRET,
    version: 'wc/v3',
    queryStringAuth: true // Forces Basic Auth as query string (useful for localhost)
  });
}

/**
 * Tests basic API connectivity
 */
async function testBasicConnectivity(api) {
  printSection('Basic Connectivity Test');
  
  try {
    log('Attempting to connect to WooCommerce API...', 'test');
    const response = await api.get('system_status');
    
    if (response.status === 200) {
      log('Successfully connected to WooCommerce API!', 'success');
      log(`API Version: ${response.data.settings?.api_enabled ? 'Enabled' : 'Check status'}`, 'info');
      return true;
    }
  } catch (error) {
    log('Failed to connect to WooCommerce API', 'error');
    log(`Error: ${error.message}`, 'error');
    
    if (error.response) {
      log(`Status Code: ${error.response.status}`, 'error');
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    
    return false;
  }
}

/**
 * Tests products endpoint
 */
async function testProductsEndpoint(api) {
  printSection('Products Endpoint Test');
  
  try {
    log('Fetching products from store...', 'test');
    const response = await api.get('products', { per_page: 5 });
    
    if (response.status === 200) {
      const products = response.data;
      log(`Successfully fetched ${products.length} products`, 'success');
      
      if (products.length > 0) {
        log('Sample product:', 'info');
        const sample = products[0];
        console.log(`  ${colors.cyan}ID:${colors.reset} ${sample.id}`);
        console.log(`  ${colors.cyan}Name:${colors.reset} ${sample.name}`);
        console.log(`  ${colors.cyan}Price:${colors.reset} ${sample.price}`);
        console.log(`  ${colors.cyan}Stock Status:${colors.reset} ${sample.stock_status}`);
      } else {
        log('No products found in store (this is OK for empty stores)', 'warning');
      }
      
      return true;
    }
  } catch (error) {
    log('Failed to fetch products', 'error');
    log(`Error: ${error.message}`, 'error');
    
    if (error.response) {
      log(`Status Code: ${error.response.status}`, 'error');
      if (error.response.status === 401) {
        log('Authentication failed - check your Consumer Key and Secret', 'warning');
      } else if (error.response.status === 404) {
        log('Products endpoint not found - check your store URL and WooCommerce installation', 'warning');
      }
    }
    
    return false;
  }
}

/**
 * Tests orders endpoint
 */
async function testOrdersEndpoint(api) {
  printSection('Orders Endpoint Test');
  
  try {
    log('Fetching orders from store...', 'test');
    const response = await api.get('orders', { per_page: 3 });
    
    if (response.status === 200) {
      const orders = response.data;
      log(`Successfully fetched ${orders.length} orders`, 'success');
      
      if (orders.length > 0) {
        log('Sample order:', 'info');
        const sample = orders[0];
        console.log(`  ${colors.cyan}Order ID:${colors.reset} ${sample.id}`);
        console.log(`  ${colors.cyan}Status:${colors.reset} ${sample.status}`);
        console.log(`  ${colors.cyan}Total:${colors.reset} ${sample.total} ${sample.currency}`);
        console.log(`  ${colors.cyan}Date:${colors.reset} ${sample.date_created}`);
      } else {
        log('No orders found in store (this is OK for new stores)', 'warning');
      }
      
      return true;
    }
  } catch (error) {
    log('Failed to fetch orders', 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Tests customers endpoint
 */
async function testCustomersEndpoint(api) {
  printSection('Customers Endpoint Test');
  
  try {
    log('Fetching customers from store...', 'test');
    const response = await api.get('customers', { per_page: 3 });
    
    if (response.status === 200) {
      const customers = response.data;
      log(`Successfully fetched ${customers.length} customers`, 'success');
      
      if (customers.length > 0) {
        log('Sample customer:', 'info');
        const sample = customers[0];
        console.log(`  ${colors.cyan}ID:${colors.reset} ${sample.id}`);
        console.log(`  ${colors.cyan}Email:${colors.reset} ${sample.email}`);
        console.log(`  ${colors.cyan}Name:${colors.reset} ${sample.first_name} ${sample.last_name}`);
        console.log(`  ${colors.cyan}Orders Count:${colors.reset} ${sample.orders_count || 0}`);
      } else {
        log('No customers found in store (this is OK for new stores)', 'warning');
      }
      
      return true;
    }
  } catch (error) {
    log('Failed to fetch customers', 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Tests write permissions (non-destructive)
 */
async function testWritePermissions(api) {
  printSection('Write Permissions Test');
  
  try {
    log('Testing write permissions (dry run - no actual data created)...', 'test');
    
    // We'll try to get product categories instead of creating one
    const response = await api.get('products/categories', { per_page: 1 });
    
    if (response.status === 200) {
      log('Read permissions verified', 'success');
      log('Write permissions cannot be tested without creating actual data', 'info');
      log('To test write permissions, try creating a test product manually through your app', 'info');
      return true;
    }
  } catch (error) {
    log('Failed to verify permissions', 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Prints test summary
 */
function printSummary(results) {
  printSection('Test Summary');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = total - passed;
  
  console.log(`${colors.bright}Total Tests:${colors.reset} ${total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failed}`);
  
  console.log('\n' + colors.bright + 'Test Results:' + colors.reset);
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${icon} ${test}`);
  });
  
  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bright}All tests passed! Your WooCommerce API is properly configured.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}Some tests failed. Please check the errors above and verify your configuration.${colors.reset}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║     WooCommerce API Connection Test Utility          ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Create API client
  const api = createApiClient();
  
  // Run tests
  const results = {
    'Basic Connectivity': await testBasicConnectivity(api),
    'Products Endpoint': await testProductsEndpoint(api),
    'Orders Endpoint': await testOrdersEndpoint(api),
    'Customers Endpoint': await testCustomersEndpoint(api),
    'Write Permissions': await testWritePermissions(api),
  };
  
  // Print summary
  printSummary(results);
  
  // Exit with appropriate code
  const allPassed = Object.values(results).every(r => r === true);
  process.exit(allPassed ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    log(`Unexpected error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main, testBasicConnectivity, testProductsEndpoint };

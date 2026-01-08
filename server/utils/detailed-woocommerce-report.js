#!/usr/bin/env node
/**
 * Detailed WooCommerce Data Fetcher with Comprehensive Logging
 * Creates a detailed report with all data, errors, warnings, and recommendations
 */

require('dotenv/config');
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;
const fs = require('fs');
const path = require('path');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

// Logging system
class Logger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info', color = colors.reset) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, type, message };
    this.logs.push(entry);
    console.log(`${color}[${timestamp}] [${type.toUpperCase()}] ${message}${colors.reset}`);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    const entry = { 
      timestamp, 
      type: 'error', 
      message,
      stack: error ? error.stack : null,
      details: error ? error.message : null
    };
    this.errors.push(entry);
    console.error(`${colors.red}[${timestamp}] [ERROR] ${message}${colors.reset}`);
    if (error) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
  }

  warning(message) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, type: 'warning', message };
    this.warnings.push(entry);
    console.warn(`${colors.yellow}[${timestamp}] [WARNING] ${message}${colors.reset}`);
  }

  success(message) {
    this.log(message, 'success', colors.green);
  }

  info(message) {
    this.log(message, 'info', colors.cyan);
  }

  getDuration() {
    return ((Date.now() - this.startTime) / 1000).toFixed(2);
  }

  generateReport() {
    return {
      summary: {
        totalLogs: this.logs.length,
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        duration: this.getDuration() + 's',
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString()
      },
      logs: this.logs,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

const logger = new Logger();

// Initialize WooCommerce API
logger.info('Initializing WooCommerce API client...');
const api = new WooCommerceRestApi({
  url: `https://${process.env.WC_STORE}`,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: 'wc/v3',
  queryStringAuth: true
});
logger.success('API client initialized successfully');

// Report data storage
const reportData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    store: process.env.WC_STORE,
    apiVersion: 'wc/v3'
  },
  products: [],
  orders: [],
  customers: [],
  categories: [],
  systemStatus: null,
  statistics: {},
  issues: [],
  recommendations: []
};

// Helper functions
function header(title) {
  const line = '═'.repeat(80);
  console.log(`\n${colors.bright}${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${line}${colors.reset}\n`);
  logger.info(`Starting: ${title}`);
}

function subheader(title) {
  console.log(`\n${colors.yellow}▶ ${title}${colors.reset}`);
  console.log('─'.repeat(80));
}

function displayObject(obj, indent = 2) {
  const spaces = ' '.repeat(indent);
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      console.log(`${spaces}${key}:`);
      displayObject(value, indent + 2);
    } else if (Array.isArray(value)) {
      console.log(`${spaces}${key}: [${value.length} items]`);
    } else {
      console.log(`${spaces}${key}: ${value}`);
    }
  }
}

// Fetch all products
async function fetchAllProducts() {
  header('FETCHING ALL PRODUCTS');
  
  try {
    logger.info('Sending request to products endpoint...');
    const startTime = Date.now();
    
    const response = await api.get('products', {
      per_page: 100,
      page: 1
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`Products fetched in ${duration}s`);
    
    const products = response.data;
    reportData.products = products;
    
    console.log(`${colors.green}✓ Total Products: ${products.length}${colors.reset}`);
    logger.info(`Found ${products.length} products`);
    
    // Analyze products
    let outOfStock = 0;
    let inStock = 0;
    let onSale = 0;
    let featured = 0;
    let noImages = 0;
    let noDescription = 0;
    let noCategory = 0;
    
    products.forEach((product, index) => {
      subheader(`Product ${index + 1}: ${product.name}`);
      
      console.log(`  ID: ${product.id}`);
      console.log(`  SKU: ${product.sku || 'N/A'}`);
      console.log(`  Type: ${product.type}`);
      console.log(`  Price: $${product.price}`);
      console.log(`  Regular Price: $${product.regular_price}`);
      console.log(`  Sale Price: ${product.sale_price ? '$' + product.sale_price : 'N/A'}`);
      console.log(`  Stock Status: ${product.stock_status}`);
      console.log(`  Stock Quantity: ${product.stock_quantity ?? 'N/A'}`);
      console.log(`  Categories: ${product.categories.map(c => c.name).join(', ') || 'None'}`);
      console.log(`  Tags: ${product.tags.map(t => t.name).join(', ') || 'None'}`);
      console.log(`  Status: ${product.status}`);
      console.log(`  Featured: ${product.featured ? 'Yes' : 'No'}`);
      console.log(`  Date Created: ${product.date_created}`);
      console.log(`  Total Sales: ${product.total_sales || 0}`);
      console.log(`  Average Rating: ${product.average_rating || 'N/A'}`);
      console.log(`  Rating Count: ${product.rating_count || 0}`);
      console.log(`  Permalink: ${product.permalink}`);
      
      // Count statistics
      if (product.stock_status === 'outofstock') {
        outOfStock++;
        logger.warning(`Product "${product.name}" is out of stock`);
        reportData.issues.push({
          type: 'out_of_stock',
          product: product.name,
          id: product.id,
          message: 'Product is out of stock'
        });
      } else {
        inStock++;
      }
      
      if (product.sale_price) {
        onSale++;
      }
      
      if (product.featured) {
        featured++;
      }
      
      if (!product.images || product.images.length === 0) {
        noImages++;
        logger.warning(`Product "${product.name}" has no images`);
        reportData.issues.push({
          type: 'no_images',
          product: product.name,
          id: product.id,
          message: 'Product has no images'
        });
      } else {
        console.log(`  Images: ${product.images.length} image(s)`);
        product.images.forEach((img, i) => {
          console.log(`    ${i + 1}. ${img.name || 'Unnamed'} - ${img.src}`);
        });
      }
      
      if (!product.description || product.description.trim() === '') {
        noDescription++;
        logger.warning(`Product "${product.name}" has no description`);
      }
      
      if (!product.categories || product.categories.length === 0) {
        noCategory++;
        logger.warning(`Product "${product.name}" has no category assigned`);
      }
    });
    
    // Store statistics
    reportData.statistics.products = {
      total: products.length,
      inStock,
      outOfStock,
      onSale,
      featured,
      noImages,
      noDescription,
      noCategory,
      averagePrice: products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / products.length
    };
    
    console.log(`\n${colors.cyan}═══ Product Statistics ═══${colors.reset}`);
    console.log(`  Total: ${products.length}`);
    console.log(`  In Stock: ${inStock} (${((inStock/products.length)*100).toFixed(1)}%)`);
    console.log(`  Out of Stock: ${outOfStock} (${((outOfStock/products.length)*100).toFixed(1)}%)`);
    console.log(`  On Sale: ${onSale}`);
    console.log(`  Featured: ${featured}`);
    console.log(`  Missing Images: ${noImages}`);
    console.log(`  Missing Description: ${noDescription}`);
    console.log(`  No Category: ${noCategory}`);
    console.log(`  Average Price: $${reportData.statistics.products.averagePrice.toFixed(2)}`);
    
    return products;
  } catch (error) {
    logger.error('Failed to fetch products', error);
    reportData.issues.push({
      type: 'api_error',
      endpoint: 'products',
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

// Fetch all orders
async function fetchAllOrders() {
  header('FETCHING ALL ORDERS');
  
  try {
    logger.info('Sending request to orders endpoint...');
    const startTime = Date.now();
    
    const response = await api.get('orders', {
      per_page: 100,
      page: 1
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`Orders fetched in ${duration}s`);
    
    const orders = response.data;
    reportData.orders = orders;
    
    console.log(`${colors.green}✓ Total Orders: ${orders.length}${colors.reset}`);
    logger.info(`Found ${orders.length} orders`);
    
    // Analyze orders
    const statusCount = {};
    const paymentMethods = {};
    let totalRevenue = 0;
    let failedRevenue = 0;
    let successfulOrders = 0;
    let failedOrders = 0;
    const customerEmails = new Set();
    const productsSold = {};
    
    orders.forEach((order, index) => {
      subheader(`Order ${index + 1}: #${order.number}`);
      
      console.log(`  Order ID: ${order.id}`);
      console.log(`  Order Number: ${order.number}`);
      console.log(`  Status: ${order.status.toUpperCase()}`);
      console.log(`  Total: $${order.total} ${order.currency}`);
      console.log(`  Payment Method: ${order.payment_method_title}`);
      console.log(`  Date Created: ${order.date_created}`);
      console.log(`  Date Modified: ${order.date_modified}`);
      console.log(`  Customer IP: ${order.customer_ip_address || 'N/A'}`);
      
      // Count statistics
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      paymentMethods[order.payment_method_title] = (paymentMethods[order.payment_method_title] || 0) + 1;
      totalRevenue += parseFloat(order.total);
      
      if (order.status === 'failed') {
        failedOrders++;
        failedRevenue += parseFloat(order.total);
        logger.warning(`Order #${order.number} failed - ${order.payment_method_title} - $${order.total}`);
      } else if (['completed', 'processing'].includes(order.status)) {
        successfulOrders++;
      }
      
      customerEmails.add(order.billing.email);
      
      // Customer info
      console.log(`\n  Customer:`);
      console.log(`    Name: ${order.billing.first_name} ${order.billing.last_name}`);
      console.log(`    Email: ${order.billing.email}`);
      console.log(`    Phone: ${order.billing.phone || 'N/A'}`);
      
      // Billing address
      console.log(`\n  Billing Address:`);
      console.log(`    ${order.billing.address_1}`);
      if (order.billing.address_2) console.log(`    ${order.billing.address_2}`);
      console.log(`    ${order.billing.city}, ${order.billing.state} ${order.billing.postcode}`);
      console.log(`    ${order.billing.country}`);
      
      // Line items
      console.log(`\n  Items (${order.line_items.length}):`);
      order.line_items.forEach((item, i) => {
        console.log(`    ${i + 1}. ${item.name}`);
        console.log(`       Qty: ${item.quantity} × $${item.price} = $${item.total}`);
        console.log(`       SKU: ${item.sku || 'N/A'}`);
        console.log(`       Product ID: ${item.product_id}`);
        
        // Track products sold
        const key = `${item.product_id}-${item.name}`;
        if (!productsSold[key]) {
          productsSold[key] = {
            id: item.product_id,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productsSold[key].quantity += item.quantity;
        productsSold[key].revenue += parseFloat(item.total);
      });
      
      // Pricing
      console.log(`\n  Pricing:`);
      console.log(`    Subtotal: $${order.total}`);
      console.log(`    Discount: $${order.discount_total}`);
      console.log(`    Shipping: $${order.shipping_total}`);
      console.log(`    Tax: $${order.total_tax}`);
      console.log(`    Total: $${order.total}`);
      
      // Order notes
      if (order.customer_note) {
        console.log(`\n  Customer Note: ${order.customer_note}`);
      }
    });
    
    // Check for critical issues
    if (failedOrders > orders.length * 0.5) {
      logger.error(`CRITICAL: ${((failedOrders/orders.length)*100).toFixed(1)}% of orders are failing!`);
      reportData.issues.push({
        type: 'critical',
        category: 'orders',
        message: `High failure rate: ${failedOrders}/${orders.length} orders failed`,
        impact: 'Revenue loss',
        lostRevenue: failedRevenue.toFixed(2)
      });
    }
    
    // Store statistics
    reportData.statistics.orders = {
      total: orders.length,
      statusBreakdown: statusCount,
      paymentMethods: paymentMethods,
      totalRevenue: totalRevenue.toFixed(2),
      failedRevenue: failedRevenue.toFixed(2),
      successfulOrders,
      failedOrders,
      averageOrderValue: (totalRevenue / orders.length).toFixed(2),
      uniqueCustomers: customerEmails.size,
      topProducts: Object.values(productsSold).sort((a, b) => b.quantity - a.quantity).slice(0, 5)
    };
    
    console.log(`\n${colors.cyan}═══ Order Statistics ═══${colors.reset}`);
    console.log(`  Total: ${orders.length}`);
    console.log(`  Successful: ${successfulOrders}`);
    console.log(`  Failed: ${failedOrders} ${failedOrders > 0 ? colors.red + '⚠️' + colors.reset : ''}`);
    console.log(`  Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`  Lost Revenue (Failed): $${failedRevenue.toFixed(2)}`);
    console.log(`  Average Order Value: $${reportData.statistics.orders.averageOrderValue}`);
    console.log(`  Unique Customers: ${customerEmails.size}`);
    
    console.log(`\n  Status Breakdown:`);
    Object.entries(statusCount).forEach(([status, count]) => {
      const percentage = ((count/orders.length)*100).toFixed(1);
      console.log(`    ${status}: ${count} (${percentage}%)`);
    });
    
    console.log(`\n  Payment Methods:`);
    Object.entries(paymentMethods).forEach(([method, count]) => {
      console.log(`    ${method}: ${count} orders`);
    });
    
    console.log(`\n  Top Selling Products:`);
    reportData.statistics.orders.topProducts.forEach((product, i) => {
      console.log(`    ${i + 1}. ${product.name}`);
      console.log(`       Sold: ${product.quantity} units`);
      console.log(`       Revenue: $${product.revenue.toFixed(2)}`);
    });
    
    return orders;
  } catch (error) {
    logger.error('Failed to fetch orders', error);
    reportData.issues.push({
      type: 'api_error',
      endpoint: 'orders',
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

// Fetch all customers
async function fetchAllCustomers() {
  header('FETCHING ALL CUSTOMERS');
  
  try {
    logger.info('Sending request to customers endpoint...');
    const startTime = Date.now();
    
    const response = await api.get('customers', {
      per_page: 100,
      page: 1
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`Customers fetched in ${duration}s`);
    
    const customers = response.data;
    reportData.customers = customers;
    
    console.log(`${colors.green}✓ Total Customers: ${customers.length}${colors.reset}`);
    logger.info(`Found ${customers.length} registered customers`);
    
    // Analyze customers
    let totalSpent = 0;
    let totalOrders = 0;
    
    customers.forEach((customer, index) => {
      subheader(`Customer ${index + 1}: ${customer.first_name} ${customer.last_name}`);
      
      console.log(`  ID: ${customer.id}`);
      console.log(`  Email: ${customer.email}`);
      console.log(`  Username: ${customer.username}`);
      console.log(`  Role: ${customer.role}`);
      console.log(`  Orders Count: ${customer.orders_count || 0}`);
      console.log(`  Total Spent: $${customer.total_spent || 0}`);
      console.log(`  Date Registered: ${customer.date_created}`);
      console.log(`  Last Modified: ${customer.date_modified || 'N/A'}`);
      
      totalSpent += parseFloat(customer.total_spent || 0);
      totalOrders += parseInt(customer.orders_count || 0);
      
      if (customer.billing && (customer.billing.first_name || customer.billing.address_1)) {
        console.log(`\n  Billing:`);
        displayObject(customer.billing, 4);
      }
      
      if (customer.shipping && (customer.shipping.first_name || customer.shipping.address_1)) {
        console.log(`\n  Shipping:`);
        displayObject(customer.shipping, 4);
      }
    });
    
    reportData.statistics.customers = {
      total: customers.length,
      totalSpent: totalSpent.toFixed(2),
      totalOrders,
      averageSpentPerCustomer: customers.length > 0 ? (totalSpent / customers.length).toFixed(2) : 0,
      averageOrdersPerCustomer: customers.length > 0 ? (totalOrders / customers.length).toFixed(2) : 0
    };
    
    console.log(`\n${colors.cyan}═══ Customer Statistics ═══${colors.reset}`);
    console.log(`  Total: ${customers.length}`);
    console.log(`  Total Spent: $${totalSpent.toFixed(2)}`);
    console.log(`  Total Orders: ${totalOrders}`);
    console.log(`  Avg Spent/Customer: $${reportData.statistics.customers.averageSpentPerCustomer}`);
    console.log(`  Avg Orders/Customer: ${reportData.statistics.customers.averageOrdersPerCustomer}`);
    
    // Check for low customer registration
    if (reportData.orders.length > 0) {
      const registrationRate = (customers.length / reportData.orders.length) * 100;
      if (registrationRate < 10) {
        logger.warning(`Low customer registration rate: ${registrationRate.toFixed(1)}%`);
        reportData.recommendations.push({
          type: 'customer_registration',
          priority: 'medium',
          message: `Only ${registrationRate.toFixed(1)}% of orders come from registered customers`,
          suggestion: 'Implement registration incentives or loyalty programs'
        });
      }
    }
    
    return customers;
  } catch (error) {
    logger.error('Failed to fetch customers', error);
    reportData.issues.push({
      type: 'api_error',
      endpoint: 'customers',
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

// Fetch categories
async function fetchCategories() {
  header('FETCHING PRODUCT CATEGORIES');
  
  try {
    logger.info('Sending request to categories endpoint...');
    const startTime = Date.now();
    
    const response = await api.get('products/categories', {
      per_page: 100
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`Categories fetched in ${duration}s`);
    
    const categories = response.data;
    reportData.categories = categories;
    
    console.log(`${colors.green}✓ Total Categories: ${categories.length}${colors.reset}`);
    logger.info(`Found ${categories.length} categories`);
    
    let emptyCategories = 0;
    
    categories.forEach((category, index) => {
      console.log(`\n  ${index + 1}. ${category.name}`);
      console.log(`     ID: ${category.id}`);
      console.log(`     Slug: ${category.slug}`);
      console.log(`     Parent: ${category.parent || 'None'}`);
      console.log(`     Count: ${category.count} products`);
      console.log(`     Description: ${category.description ? 'Yes' : 'No'}`);
      
      if (category.count === 0) {
        emptyCategories++;
        logger.warning(`Category "${category.name}" has no products`);
      }
    });
    
    reportData.statistics.categories = {
      total: categories.length,
      empty: emptyCategories,
      withProducts: categories.length - emptyCategories
    };
    
    console.log(`\n${colors.cyan}═══ Category Statistics ═══${colors.reset}`);
    console.log(`  Total: ${categories.length}`);
    console.log(`  With Products: ${categories.length - emptyCategories}`);
    console.log(`  Empty: ${emptyCategories}`);
    
    if (emptyCategories > 0) {
      reportData.recommendations.push({
        type: 'empty_categories',
        priority: 'low',
        message: `${emptyCategories} categories have no products`,
        suggestion: 'Remove empty categories or add products to them'
      });
    }
    
    return categories;
  } catch (error) {
    logger.error('Failed to fetch categories', error);
    reportData.issues.push({
      type: 'api_error',
      endpoint: 'categories',
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

// Fetch system status
async function fetchSystemStatus() {
  header('FETCHING SYSTEM STATUS');
  
  try {
    logger.info('Sending request to system_status endpoint...');
    const startTime = Date.now();
    
    const response = await api.get('system_status');
    const status = response.data;
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`System status fetched in ${duration}s`);
    
    reportData.systemStatus = status;
    
    console.log(`\n  Environment:`);
    console.log(`    Home URL: ${status.environment?.home_url || 'N/A'}`);
    console.log(`    Site URL: ${status.environment?.site_url || 'N/A'}`);
    console.log(`    WC Version: ${status.environment?.version || 'N/A'}`);
    console.log(`    WordPress Version: ${status.environment?.wp_version || 'N/A'}`);
    console.log(`    PHP Version: ${status.environment?.php_version || 'N/A'}`);
    console.log(`    MySQL Version: ${status.environment?.mysql_version || 'N/A'}`);
    console.log(`    Max Upload Size: ${status.environment?.max_upload_size || 'N/A'}`);
    console.log(`    Memory Limit: ${status.environment?.memory_limit || 'N/A'}`);
    
    if (status.database) {
      console.log(`\n  Database:`);
      console.log(`    WC Database Version: ${status.database?.wc_database_version || 'N/A'}`);
    }
    
    if (status.active_plugins) {
      console.log(`\n  Active Plugins: ${status.active_plugins.length}`);
      status.active_plugins.slice(0, 10).forEach((plugin, i) => {
        console.log(`    ${i + 1}. ${plugin.name || plugin}`);
      });
      if (status.active_plugins.length > 10) {
        console.log(`    ... and ${status.active_plugins.length - 10} more`);
      }
    }
    
    return status;
  } catch (error) {
    logger.error('Failed to fetch system status', error);
    reportData.issues.push({
      type: 'api_error',
      endpoint: 'system_status',
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

// Generate recommendations
function generateRecommendations() {
  header('GENERATING RECOMMENDATIONS');
  
  logger.info('Analyzing data for recommendations...');
  
  // Check for payment issues
  if (reportData.statistics.orders?.failedOrders > 0) {
    const failureRate = (reportData.statistics.orders.failedOrders / reportData.statistics.orders.total) * 100;
    if (failureRate > 50) {
      reportData.recommendations.push({
        type: 'payment_gateway',
        priority: 'critical',
        message: `${failureRate.toFixed(1)}% of orders are failing`,
        suggestion: 'Check PayPal integration settings immediately',
        impact: `Lost revenue: $${reportData.statistics.orders.failedRevenue}`
      });
    }
  }
  
  // Check stock levels
  if (reportData.statistics.products?.outOfStock > 0) {
    reportData.recommendations.push({
      type: 'inventory',
      priority: 'high',
      message: `${reportData.statistics.products.outOfStock} products are out of stock`,
      suggestion: 'Restock popular items or mark them as unavailable'
    });
  }
  
  // Check for missing product images
  if (reportData.statistics.products?.noImages > 0) {
    reportData.recommendations.push({
      type: 'product_images',
      priority: 'medium',
      message: `${reportData.statistics.products.noImages} products have no images`,
      suggestion: 'Add product images to improve conversion rates'
    });
  }
  
  // Display recommendations
  if (reportData.recommendations.length > 0) {
    console.log(`${colors.yellow}\nFound ${reportData.recommendations.length} recommendations:${colors.reset}\n`);
    
    reportData.recommendations.forEach((rec, i) => {
      const priorityColor = rec.priority === 'critical' ? colors.red :
                           rec.priority === 'high' ? colors.yellow :
                           rec.priority === 'medium' ? colors.cyan : colors.dim;
      
      console.log(`${priorityColor}${i + 1}. [${rec.priority.toUpperCase()}] ${rec.type}${colors.reset}`);
      console.log(`   ${rec.message}`);
      console.log(`   → ${rec.suggestion}`);
      if (rec.impact) console.log(`   Impact: ${rec.impact}`);
      console.log('');
    });
  } else {
    console.log(`${colors.green}No critical recommendations found!${colors.reset}`);
  }
}

// Save report to file
function saveReport() {
  header('SAVING DETAILED REPORT');
  
  try {
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
      logger.info('Created reports directory');
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `woocommerce-report-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);
    
    const fullReport = {
      ...reportData,
      logging: logger.generateReport()
    };
    
    fs.writeFileSync(filepath, JSON.stringify(fullReport, null, 2));
    logger.success(`Report saved to: ${filepath}`);
    
    // Also save a markdown version
    const mdFilename = `woocommerce-report-${timestamp}.md`;
    const mdFilepath = path.join(reportDir, mdFilename);
    const markdown = generateMarkdownReport(fullReport);
    fs.writeFileSync(mdFilepath, markdown);
    logger.success(`Markdown report saved to: ${mdFilepath}`);
    
    console.log(`\n${colors.green}✓ Reports saved:${colors.reset}`);
    console.log(`  JSON: ${colors.cyan}${filepath}${colors.reset}`);
    console.log(`  Markdown: ${colors.cyan}${mdFilepath}${colors.reset}`);
    
    return { json: filepath, markdown: mdFilepath };
  } catch (error) {
    logger.error('Failed to save report', error);
    return null;
  }
}

// Generate markdown report
function generateMarkdownReport(data) {
  const md = [];
  
  md.push('# WooCommerce Detailed Data Report\n');
  md.push(`**Store:** ${data.metadata.store}  `);
  md.push(`**Generated:** ${data.metadata.generatedAt}  `);
  md.push(`**Duration:** ${data.logging.summary.duration}  \n`);
  
  md.push('---\n');
  
  // Executive Summary
  md.push('## 📊 Executive Summary\n');
  md.push(`- **Products:** ${data.statistics.products?.total || 0}`);
  md.push(`- **Orders:** ${data.statistics.orders?.total || 0}`);
  md.push(`- **Customers:** ${data.statistics.customers?.total || 0}`);
  md.push(`- **Categories:** ${data.statistics.categories?.total || 0}`);
  md.push(`- **Total Revenue:** $${data.statistics.orders?.totalRevenue || 0}`);
  md.push(`- **Errors:** ${data.logging.summary.totalErrors}`);
  md.push(`- **Warnings:** ${data.logging.summary.totalWarnings}\n`);
  
  // Issues
  if (data.issues.length > 0) {
    md.push('## ⚠️ Issues Found\n');
    data.issues.forEach((issue, i) => {
      md.push(`### ${i + 1}. ${issue.type}`);
      md.push(`- **Message:** ${issue.message}`);
      if (issue.product) md.push(`- **Product:** ${issue.product}`);
      if (issue.lostRevenue) md.push(`- **Lost Revenue:** $${issue.lostRevenue}`);
      md.push('');
    });
  }
  
  // Recommendations
  if (data.recommendations.length > 0) {
    md.push('## 💡 Recommendations\n');
    data.recommendations.forEach((rec, i) => {
      md.push(`### ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`);
      md.push(`**Issue:** ${rec.message}  `);
      md.push(`**Suggestion:** ${rec.suggestion}  `);
      if (rec.impact) md.push(`**Impact:** ${rec.impact}  `);
      md.push('');
    });
  }
  
  // Product Statistics
  if (data.statistics.products) {
    md.push('## 🛍️ Product Statistics\n');
    const p = data.statistics.products;
    md.push(`- Total: ${p.total}`);
    md.push(`- In Stock: ${p.inStock} (${((p.inStock/p.total)*100).toFixed(1)}%)`);
    md.push(`- Out of Stock: ${p.outOfStock} (${((p.outOfStock/p.total)*100).toFixed(1)}%)`);
    md.push(`- On Sale: ${p.onSale}`);
    md.push(`- Featured: ${p.featured}`);
    md.push(`- Missing Images: ${p.noImages}`);
    md.push(`- Average Price: $${p.averagePrice.toFixed(2)}\n`);
  }
  
  // Order Statistics
  if (data.statistics.orders) {
    md.push('## 📦 Order Statistics\n');
    const o = data.statistics.orders;
    md.push(`- Total: ${o.total}`);
    md.push(`- Successful: ${o.successfulOrders}`);
    md.push(`- Failed: ${o.failedOrders}`);
    md.push(`- Total Revenue: $${o.totalRevenue}`);
    md.push(`- Lost Revenue: $${o.failedRevenue}`);
    md.push(`- Average Order Value: $${o.averageOrderValue}`);
    md.push(`- Unique Customers: ${o.uniqueCustomers}\n`);
    
    md.push('### Top Products\n');
    o.topProducts.forEach((product, i) => {
      md.push(`${i + 1}. **${product.name}** - ${product.quantity} units - $${product.revenue.toFixed(2)}`);
    });
    md.push('');
  }
  
  // System Info
  if (data.systemStatus) {
    md.push('## 💻 System Information\n');
    const env = data.systemStatus.environment || {};
    md.push(`- WooCommerce: ${env.version}`);
    md.push(`- WordPress: ${env.wp_version}`);
    md.push(`- PHP: ${env.php_version}`);
    md.push(`- MySQL: ${env.mysql_version}\n`);
  }
  
  // Error Log
  if (data.logging.errors.length > 0) {
    md.push('## 🔴 Error Log\n');
    data.logging.errors.forEach((error, i) => {
      md.push(`### Error ${i + 1}`);
      md.push(`- **Time:** ${error.timestamp}`);
      md.push(`- **Message:** ${error.message}`);
      if (error.details) md.push(`- **Details:** ${error.details}`);
      md.push('```');
      md.push(error.stack || 'No stack trace');
      md.push('```\n');
    });
  }
  
  md.push('---\n');
  md.push(`*Report generated by WooCommerce Detailed Reporter*  `);
  md.push(`*Execution time: ${data.logging.summary.duration}*`);
  
  return md.join('\n');
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║        WooCommerce Detailed Data Reporter with Error Tracking         ║');
  console.log('║                    ' + process.env.WC_STORE + '                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  logger.info('Starting comprehensive data fetch...');
  
  try {
    // Fetch all data
    await fetchAllProducts();
    await fetchAllOrders();
    await fetchAllCustomers();
    await fetchCategories();
    await fetchSystemStatus();
    
    // Generate recommendations
    generateRecommendations();
    
    // Display summary
    header('FINAL SUMMARY');
    
    console.log(`${colors.green}✓ Products: ${reportData.products.length}${colors.reset}`);
    console.log(`${colors.green}✓ Orders: ${reportData.orders.length}${colors.reset}`);
    console.log(`${colors.green}✓ Customers: ${reportData.customers.length}${colors.reset}`);
    console.log(`${colors.green}✓ Categories: ${reportData.categories.length}${colors.reset}`);
    
    if (reportData.issues.length > 0) {
      console.log(`${colors.red}⚠ Issues Found: ${reportData.issues.length}${colors.reset}`);
    }
    
    if (reportData.recommendations.length > 0) {
      console.log(`${colors.yellow}💡 Recommendations: ${reportData.recommendations.length}${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}⏱  Total Duration: ${logger.getDuration()}s${colors.reset}`);
    console.log(`${colors.dim}Total Logs: ${logger.logs.length}${colors.reset}`);
    console.log(`${colors.dim}Errors: ${logger.errors.length}${colors.reset}`);
    console.log(`${colors.dim}Warnings: ${logger.warnings.length}${colors.reset}`);
    
    // Save report
    const files = saveReport();
    
    console.log(`\n${colors.bright}${colors.green}✓ All data fetched and reported successfully!${colors.reset}\n`);
    
    if (files) {
      console.log(`${colors.cyan}📄 View your detailed reports at:${colors.reset}`);
      console.log(`   ${files.json}`);
      console.log(`   ${files.markdown}`);
    }
    
  } catch (error) {
    logger.error('Fatal error during execution', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  logger.error('Unhandled error', error);
  process.exit(1);
});

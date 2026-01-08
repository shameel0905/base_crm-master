const https = require('https');
require('dotenv').config();

const SHOPIFY_STORE = 'devbaseprod.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_STORE,
      path: `/admin/api/${SHOPIFY_API_VERSION}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'User-Agent': 'BaseCRM/1.0',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            console.error(`\n[ERROR] Status ${res.statusCode}`);
            console.error('Response:', JSON.stringify(parsedData, null, 2));
            const error = new Error(`Shopify API Error: ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.data = parsedData;
            reject(error);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout`));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testWithExplicitOptions() {
  console.log('\n=== TEST: With Explicit Options Definition ===\n');
  console.log('Testing if Shopify requires options to be explicitly defined\n');
  
  const product = {
    product: {
      title: `Explicit-Options-${Date.now()}`,
      body_html: 'Product with explicit options',
      vendor: 'Test',
      product_type: 'Test',
      handle: `explicit-options-${Date.now()}`,
      // Try explicitly defining the options
      options: [
        { name: 'Color', position: 1 },
        { name: 'Size', position: 2 }
      ],
      variants: [
        { sku: 'SKU1', price: '19.99', option1: 'Red', option2: 'S' },
        { sku: 'SKU2', price: '19.99', option1: 'Red', option2: 'M' },
        { sku: 'SKU3', price: '19.99', option1: 'Blue', option2: 'S' },
        { sku: 'SKU4', price: '19.99', option1: 'Blue', option2: 'M' },
      ]
    }
  };

  console.log('Payload includes explicit options array');
  console.log('Options:', product.product.options);
  console.log('Variants:', product.product.variants);
  console.log('\n');

  try {
    const result = await makeRequest('POST', '/products.json', product);
    console.log('✅ SUCCESS!');
    console.log('Product ID:', result.product.id);
    console.log('Variants:', result.product.variants.length);
    result.product.variants.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.title}`);
    });
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
}

testWithExplicitOptions();

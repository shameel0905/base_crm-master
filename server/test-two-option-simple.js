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
            console.error('Full Response:', JSON.stringify(parsedData, null, 2));
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

async function testTwoOption() {
  console.log('\n=== TEST: Two-Option Product ===\n');
  
  // Very simple 2-option product: 2 sizes × 2 colors = 4 variants
  const product = {
    product: {
      title: 'Simple T-Shirt',
      body_html: 'A simple t-shirt with size and color options',
      vendor: 'Test Vendor',
      product_type: 'Apparel',
      handle: `simple-tshirt-${Date.now()}`,
      variants: [
        {
          sku: 'TS-SM-BLK',
          price: '29.99',
          inventory_quantity: 10,
          option1: 'Small',
          option2: 'Black'
        },
        {
          sku: 'TS-SM-WHT',
          price: '29.99',
          inventory_quantity: 10,
          option1: 'Small',
          option2: 'White'
        },
        {
          sku: 'TS-LG-BLK',
          price: '29.99',
          inventory_quantity: 10,
          option1: 'Large',
          option2: 'Black'
        },
        {
          sku: 'TS-LG-WHT',
          price: '29.99',
          inventory_quantity: 10,
          option1: 'Large',
          option2: 'White'
        }
      ]
    }
  };

  console.log('Request payload:');
  console.log(JSON.stringify(product, null, 2));
  console.log('\n');

  try {
    const result = await makeRequest('POST', '/products.json', product);
    console.log('✅ SUCCESS! Product created:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
  }
}

testTwoOption();

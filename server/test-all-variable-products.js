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

async function testVariableProducts() {
  
  // TEST 1: Single Option (Color only)
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: Single Option Product (No explicit options needed)');
  console.log('='.repeat(70));
  
  const test1 = {
    product: {
      title: `Snowboard-SingleOption-${Date.now()}`,
      body_html: 'Available in 5 colors',
      vendor: 'Snowboard Co',
      product_type: 'Snowboard',
      handle: `snowboard-color-${Date.now()}`,
      variants: [
        { sku: 'SNOW-ICE', price: '699.95', option1: 'Ice' },
        { sku: 'SNOW-DAWN', price: '699.95', option1: 'Dawn' },
        { sku: 'SNOW-POWDER', price: '699.95', option1: 'Powder' },
      ]
    }
  };

  try {
    const result = await makeRequest('POST', '/products.json', test1);
    console.log('✅ SUCCESS');
    console.log(`   Product ID: ${result.product.id}`);
    console.log(`   Variants: ${result.product.variants.length}`);
    result.product.variants.forEach(v => console.log(`     - ${v.title} (${v.sku})`));
  } catch (err) {
    console.error('❌ FAILED:', err.data?.errors || err.message);
  }

  // TEST 2: Two Options (with explicit options array)
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: Two Option Product (MUST include explicit options array)');
  console.log('='.repeat(70));
  
  const test2 = {
    product: {
      title: `TShirt-TwoOptions-${Date.now()}`,
      body_html: 'T-Shirt in multiple colors and sizes',
      vendor: 'Fashion Co',
      product_type: 'Apparel',
      handle: `tshirt-colsize-${Date.now()}`,
      // CRITICAL: Must explicitly define options for 2+ option products
      options: [
        { name: 'Color', position: 1 },
        { name: 'Size', position: 2 }
      ],
      variants: [
        { sku: 'TS-RED-S', price: '29.99', option1: 'Red', option2: 'Small' },
        { sku: 'TS-RED-M', price: '29.99', option1: 'Red', option2: 'Medium' },
        { sku: 'TS-RED-L', price: '29.99', option1: 'Red', option2: 'Large' },
        { sku: 'TS-BLU-S', price: '29.99', option1: 'Blue', option2: 'Small' },
        { sku: 'TS-BLU-M', price: '29.99', option1: 'Blue', option2: 'Medium' },
        { sku: 'TS-BLU-L', price: '29.99', option1: 'Blue', option2: 'Large' },
      ]
    }
  };

  try {
    const result = await makeRequest('POST', '/products.json', test2);
    console.log('✅ SUCCESS');
    console.log(`   Product ID: ${result.product.id}`);
    console.log(`   Variants: ${result.product.variants.length}`);
    console.log(`   Options: ${result.product.options.map(o => `${o.name} (${o.values.join(',')})`).join(' | ')}`);
    result.product.variants.slice(0, 3).forEach(v => console.log(`     - ${v.title}`));
    console.log(`     ... and ${result.product.variants.length - 3} more`);
  } catch (err) {
    console.error('❌ FAILED:', err.data?.errors || err.message);
  }

  // TEST 3: Three Options (with explicit options array)
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: Three Option Product (MUST include explicit options array)');
  console.log('='.repeat(70));
  
  const test3 = {
    product: {
      title: `Shoe-ThreeOptions-${Date.now()}`,
      body_html: 'Shoes in multiple styles, colors, and sizes',
      vendor: 'Shoe Co',
      product_type: 'Footwear',
      handle: `shoe-stylecol-${Date.now()}`,
      // CRITICAL: Must explicitly define all 3 options
      options: [
        { name: 'Style', position: 1 },
        { name: 'Color', position: 2 },
        { name: 'Size', position: 3 }
      ],
      variants: [
        // Sneaker - Red
        { sku: 'SHOE-SNEAK-RED-7', price: '89.99', option1: 'Sneaker', option2: 'Red', option3: '7' },
        { sku: 'SHOE-SNEAK-RED-8', price: '89.99', option1: 'Sneaker', option2: 'Red', option3: '8' },
        // Sneaker - Blue
        { sku: 'SHOE-SNEAK-BLU-7', price: '89.99', option1: 'Sneaker', option2: 'Blue', option3: '7' },
        { sku: 'SHOE-SNEAK-BLU-8', price: '89.99', option1: 'Sneaker', option2: 'Blue', option3: '8' },
        // Boot - Red
        { sku: 'SHOE-BOOT-RED-7', price: '129.99', option1: 'Boot', option2: 'Red', option3: '7' },
        { sku: 'SHOE-BOOT-RED-8', price: '129.99', option1: 'Boot', option2: 'Red', option3: '8' },
        // Boot - Blue
        { sku: 'SHOE-BOOT-BLU-7', price: '129.99', option1: 'Boot', option2: 'Blue', option3: '7' },
        { sku: 'SHOE-BOOT-BLU-8', price: '129.99', option1: 'Boot', option2: 'Blue', option3: '8' },
      ]
    }
  };

  try {
    const result = await makeRequest('POST', '/products.json', test3);
    console.log('✅ SUCCESS');
    console.log(`   Product ID: ${result.product.id}`);
    console.log(`   Variants: ${result.product.variants.length}`);
    console.log(`   Options: ${result.product.options.map(o => `${o.name} (${o.values.join(',')})`).join(' | ')}`);
    result.product.variants.slice(0, 3).forEach(v => console.log(`     - ${v.title}`));
    console.log(`     ... and ${result.product.variants.length - 3} more`);
  } catch (err) {
    console.error('❌ FAILED:', err.data?.errors || err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY:');
  console.log('='.repeat(70));
  console.log(`
KEY FINDINGS:
1. Single Option (Color only): 
   - Do NOT need explicit options array
   - Use option1 in variants
   - Shopify auto-generates "Title" option name

2. Two Options (Color + Size):
   - MUST include explicit options array with name and position
   - Use option1 and option2 in variants
   - Options define the structure

3. Three Options (Style + Color + Size):
   - MUST include explicit options array
   - Use option1, option2, and option3 in variants
   - All variants must have complete combinations
  `);
}

testVariableProducts();

/**
 * Fetch "The Complete Snowboard" product from Shopify
 * Analyze variant structure to understand how Shopify organizes variable products
 */

const https = require('https');
require('dotenv').config();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

/**
 * Make HTTPS request to Shopify API
 */
function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    const options = {
      hostname: SHOPIFY_STORE,
      path: `/admin/api/${SHOPIFY_API_VERSION}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'User-Agent': 'BaseCRM/1.0',
      },
      timeout: 15000,
    };

    console.log(`[Shopify API] ${method} ${options.path}`);

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
            console.error(`Status: ${res.statusCode}`);
            console.error('Error Response:', JSON.stringify(parsedData, null, 2));
            reject(new Error(`Shopify API Error: ${res.statusCode}`));
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

    req.end();
  });
}

/**
 * Search for products by title
 */
async function searchProductByTitle(title) {
  console.log(`\n🔍 Searching for product: "${title}"`);
  
  try {
    // Use Shopify's search endpoint or list products
    const query = encodeURIComponent(`title:"${title}"`);
    const path = `/products.json?title=${encodeURIComponent(title)}&limit=1`;
    
    const response = await makeRequest('GET', path);
    
    if (response.products && response.products.length > 0) {
      return response.products[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching product:', error.message);
    return null;
  }
}

/**
 * Fetch product by ID with full details
 */
async function getProductById(productId) {
  console.log(`\n📦 Fetching product ID: ${productId}`);
  
  try {
    const response = await makeRequest('GET', `/products/${productId}.json`);
    return response.product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }
}

/**
 * List all products to find the snowboard
 */
async function listAllProducts() {
  console.log(`\n📋 Listing first 50 products to find snowboard...`);
  
  try {
    const response = await makeRequest('GET', `/products.json?limit=50&fields=id,title,handle,product_type,variants`);
    return response.products || [];
  } catch (error) {
    console.error('Error listing products:', error.message);
    return [];
  }
}

/**
 * Analyze and pretty-print variant structure
 */
function analyzeVariantStructure(product) {
  console.log('\n========================================');
  console.log('📊 PRODUCT VARIANT STRUCTURE ANALYSIS');
  console.log('========================================\n');

  console.log(`Product Title: ${product.title}`);
  console.log(`Product Handle: ${product.handle}`);
  console.log(`Product Type: ${product.product_type}`);
  console.log(`Vendor: ${product.vendor}`);
  console.log(`Total Variants: ${product.variants.length}\n`);

  // Analyze options
  if (product.options && product.options.length > 0) {
    console.log('📍 PRODUCT OPTIONS:');
    product.options.forEach((option, idx) => {
      console.log(`  [${idx}] Name: ${option.name}`);
      console.log(`      Values: ${option.values.join(', ')}`);
      console.log(`      Position: ${option.position}\n`);
    });
  }

  // Analyze variants
  console.log('\n🔄 VARIANTS STRUCTURE:');
  console.log('─'.repeat(100));

  product.variants.slice(0, 10).forEach((variant, idx) => {
    console.log(`\n[Variant ${idx + 1}]`);
    console.log(`  ID: ${variant.id}`);
    console.log(`  Title: ${variant.title}`);
    console.log(`  SKU: ${variant.sku}`);
    console.log(`  Price: ${variant.price}`);
    console.log(`  Compare At Price: ${variant.compare_at_price || 'N/A'}`);
    console.log(`  Inventory Quantity: ${variant.inventory_quantity}`);
    console.log(`  Option1: ${variant.option1}`);
    console.log(`  Option2: ${variant.option2}`);
    console.log(`  Option3: ${variant.option3 || 'N/A'}`);
    console.log(`  Weight: ${variant.weight} ${variant.weight_unit}`);
    console.log(`  Requires Shipping: ${variant.requires_shipping}`);
    console.log(`  Taxable: ${variant.taxable}`);
    console.log(`  Barcode: ${variant.barcode || 'N/A'}`);
    console.log(`  Position: ${variant.position}`);
  });

  if (product.variants.length > 10) {
    console.log(`\n... and ${product.variants.length - 10} more variants`);
  }

  // Create template for creating similar product
  console.log('\n\n========================================');
  console.log('📋 TEMPLATE FOR CREATING VARIABLE PRODUCT');
  console.log('========================================\n');

  const template = {
    title: product.title,
    product_type: product.product_type,
    vendor: product.vendor,
    body_html: product.body_html || '',
    variants: product.variants.map(v => ({
      title: v.title,
      sku: v.sku,
      price: v.price,
      compare_at_price: v.compare_at_price,
      inventory_quantity: v.inventory_quantity,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
    })),
    options: product.options.map(o => ({
      name: o.name,
      values: o.values,
    })),
  };

  console.log(JSON.stringify(template, null, 2));

  return template;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Snowboard Product Analysis\n');

  try {
    // Step 1: List products to find snowboard
    let products = await listAllProducts();
    
    // Step 2: Search for "The Complete Snowboard"
    let snowboardProduct = products.find(p => 
      p.title && p.title.toLowerCase().includes('snowboard')
    );

    if (!snowboardProduct) {
      console.log('\n❌ Snowboard not found in first 50 products');
      console.log('Fetching product by direct search...');
      snowboardProduct = await searchProductByTitle('The Complete Snowboard');
    }

    if (!snowboardProduct) {
      console.log('\n❌ Could not find "The Complete Snowboard" product');
      console.log('\n📌 Available products:');
      products.slice(0, 20).forEach(p => {
        console.log(`   - ${p.title}`);
      });
      return;
    }

    // Step 3: Fetch full product details
    const fullProduct = await getProductById(snowboardProduct.id);

    if (!fullProduct) {
      console.log('❌ Could not fetch full product details');
      return;
    }

    // Step 4: Analyze structure
    const template = analyzeVariantStructure(fullProduct);

    // Step 5: Show raw JSON for reference
    console.log('\n\n========================================');
    console.log('📄 FULL PRODUCT JSON (First variant details)');
    console.log('========================================\n');
    
    console.log(JSON.stringify({
      id: fullProduct.id,
      title: fullProduct.title,
      handle: fullProduct.handle,
      product_type: fullProduct.product_type,
      vendor: fullProduct.vendor,
      body_html: fullProduct.body_html,
      options: fullProduct.options,
      variants: fullProduct.variants.slice(0, 3),
      images: fullProduct.images.slice(0, 2),
    }, null, 2));

    console.log('\n✅ Analysis Complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

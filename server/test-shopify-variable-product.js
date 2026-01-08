/**
 * Test Case: Shopify Variable Product (Product with Variants)
 * Based on Shopify Storefront API Product object specification
 * Tests creating products with multiple variants and validating response
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api/shopify';

// Expected response fields based on Storefront API
const EXPECTED_PRODUCT_FIELDS = [
  'id',
  'title',
  'handle',
  'description',
  'vendor',
  'productType',
  'variants',
  'images',
  'availableForSale',
  'createdAt',
  'updatedAt',
];

const EXPECTED_VARIANT_FIELDS = [
  'id',
  'title',
  'price',
  'sku',
  'inventory_quantity',
  'availableForSale',
];

/**
 * Test 1: Create a simple product with variants
 */
async function testVariableProductCreation() {
  console.log('\n========================================');
  console.log('TEST 1: Create Variable Product (T-Shirt with Variants)');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'Premium Cotton T-Shirt',
      description: 'High-quality 100% cotton t-shirt available in multiple sizes and colors. Comfortable fit, perfect for everyday wear.',
      vendor: 'Fashion Brand Co.',
      type: 'Apparel',
      slug: 'premium-cotton-tshirt-var',
      price: 29.99,  // Use number instead of string
      variants: [
        {
          price: 29.99,
          sku: 'TSHIRT-S-BLK-001',
          inventory_quantity: 50,
          title: 'Small - Black',
        },
        {
          price: 29.99,
          sku: 'TSHIRT-M-BLK-001',
          inventory_quantity: 75,
          title: 'Medium - Black',
        },
        {
          price: 29.99,
          sku: 'TSHIRT-L-BLK-001',
          inventory_quantity: 60,
          title: 'Large - Black',
        },
        {
          price: 32.99,
          sku: 'TSHIRT-XL-BLK-001',
          inventory_quantity: 40,
          title: 'X-Large - Black',
        },
        {
          price: 29.99,
          sku: 'TSHIRT-S-WHT-001',
          inventory_quantity: 45,
          title: 'Small - White',
        },
        {
          price: 29.99,
          sku: 'TSHIRT-M-WHT-001',
          inventory_quantity: 80,
          title: 'Medium - White',
        },
      ],
      images: ['https://via.placeholder.com/500x500?text=Premium+Cotton+Tshirt'],
    };

    console.log('📤 Sending Request to /api/shopify/products');
    console.log('Payload Summary:');
    console.log(`  - Title: ${productData.title}`);
    console.log(`  - Variants: ${productData.variants.length}`);
    console.log(`  - Base Price: $${productData.price}`);

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log('\n✅ SUCCESS - Product Created!');
    console.log(`Response Status: ${response.status}`);

    const product = response.data.data || response.data;
    console.log('\n📊 Product Details:');
    console.log(`  ID: ${product.id}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Title: ${product.title}`);
    console.log(`  Vendor: ${product.vendor}`);
    console.log(`  Type: ${product.product_type}`);

    if (product.variants && Array.isArray(product.variants)) {
      console.log(`\n📦 Variants (${product.variants.length} total):`);
      product.variants.forEach((variant, idx) => {
        console.log(`  [${idx + 1}] ${variant.title}`);
        console.log(`      SKU: ${variant.sku}`);
        console.log(`      Price: $${variant.price}`);
        console.log(`      Inventory: ${variant.inventory_quantity} units`);
      });
    }

    console.log('\n✅ Full Response:');
    console.log(JSON.stringify(response.data, null, 2));

    return product.id;
  } catch (error) {
    console.error('\n❌ ERROR - Product Creation Failed');
    console.error(`HTTP Status: ${error.response?.status}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.response?.data) {
      console.error('\nError Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

/**
 * Test 2: Create a product with price variants (same product, different prices)
 */
async function testPriceVariantProduct() {
  console.log('\n========================================');
  console.log('TEST 2: Create Product with Price Variants (Subscription Tiers)');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'Software Subscription Plan',
      description: 'Flexible subscription plans for our premium software. Choose the plan that fits your needs.',
      vendor: 'SoftCorp Inc.',
      type: 'Digital Product',
      slug: 'software-subscription-var2',
      price: 9.99,
      variants: [
        {
          price: 9.99,
          sku: 'SUB-BASIC-MO-001',
          inventory_quantity: 9999,
          title: 'Basic - Monthly',
        },
        {
          price: 24.99,
          sku: 'SUB-BASIC-QT-001',
          inventory_quantity: 9999,
          title: 'Basic - Quarterly',
        },
        {
          price: 79.99,
          sku: 'SUB-BASIC-YR-001',
          inventory_quantity: 9999,
          title: 'Basic - Yearly',
        },
        {
          price: 19.99,
          sku: 'SUB-PRO-MO-001',
          inventory_quantity: 9999,
          title: 'Pro - Monthly',
        },
        {
          price: 49.99,
          sku: 'SUB-PRO-QT-001',
          inventory_quantity: 9999,
          title: 'Pro - Quarterly',
        },
        {
          price: 159.99,
          sku: 'SUB-PRO-YR-001',
          inventory_quantity: 9999,
          title: 'Pro - Yearly',
        },
      ],
      images: ['https://via.placeholder.com/500x500?text=Software+Subscription'],
    };

    console.log('📤 Sending Request to /api/shopify/products');
    console.log('Payload Summary:');
    console.log(`  - Title: ${productData.title}`);
    console.log(`  - Variants: ${productData.variants.length}`);
    console.log(`  - Price Range: $${Math.min(...productData.variants.map(v => v.price))} - $${Math.max(...productData.variants.map(v => v.price))}`);

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log('\n✅ SUCCESS - Product Created!');
    const product = response.data.data || response.data;
    
    console.log(`\n📊 Product Details:`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Title: ${product.title}`);

    if (product.variants && Array.isArray(product.variants)) {
      console.log(`\n💰 Price Variants (${product.variants.length} total):`);
      const sortedVariants = product.variants.sort((a, b) => a.price - b.price);
      sortedVariants.forEach((variant) => {
        console.log(`  • ${variant.title.padEnd(20)} | $${variant.price.toFixed(2).padStart(7)} | SKU: ${variant.sku}`);
      });
    }

    return product.id;
  } catch (error) {
    console.error('\n❌ ERROR - Product Creation Failed');
    console.error(`HTTP Status: ${error.response?.status}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.response?.data) {
      console.error('\nError Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

/**
 * Test 3: Verify product was created with variants
 */
async function testGetProductWithVariants(productId) {
  console.log(`\n========================================`);
  console.log(`TEST 3: Retrieve Product with Variants (ID: ${productId})`);
  console.log('========================================\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('✅ Product Retrieved Successfully');
    console.log('Product Details:');
    console.log(JSON.stringify(response.data, null, 2));

    // Validate variant structure
    if (response.data.data?.variants) {
      console.log(`\n📊 Variants Summary:`);
      console.log(`Total Variants: ${response.data.data.variants.length}`);
      response.data.data.variants.forEach((variant, idx) => {
        console.log(`  [${idx + 1}] SKU: ${variant.sku}, Price: $${variant.price}, Stock: ${variant.inventory_quantity}`);
      });
    }
  } catch (error) {
    console.error('❌ Error retrieving product:', error.response?.data || error.message);
  }
}

/**
 * Test 4: Create product without variants (fallback to single default variant)
 */
async function testSimpleProduct() {
  console.log('\n========================================');
  console.log('TEST 4: Create Simple Product (Auto-generates Default Variant)');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'Simple Widget',
      description: 'A basic widget with single default variant. Great starter product.',
      vendor: 'Widget Co.',
      type: 'Physical Product',
      slug: 'simple-widget-var',
      price: 15.99,
      stock_quantity: 100,
      sku: 'WIDGET-SIMPLE-001',
      images: ['https://via.placeholder.com/500x500?text=Simple+Widget'],
    };

    console.log('📤 Sending Request to /api/shopify/products');
    console.log('Payload Summary:');
    console.log(`  - Title: ${productData.title}`);
    console.log(`  - Price: $${productData.price}`);
    console.log(`  - Stock: ${productData.stock_quantity} units`);
    console.log(`  - Note: No variants specified - will auto-generate default variant`);

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log('\n✅ SUCCESS - Simple Product Created!');
    const product = response.data.data || response.data;

    console.log(`\n📊 Product Details:`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Title: ${product.title}`);

    if (product.variants && Array.isArray(product.variants)) {
      console.log(`\n🏷️ Auto-Generated Variant:`);
      const variant = product.variants[0];
      console.log(`  Title: ${variant.title}`);
      console.log(`  SKU: ${variant.sku}`);
      console.log(`  Price: $${variant.price}`);
      console.log(`  Inventory: ${variant.inventory_quantity} units`);
    }

    return product.id;
  } catch (error) {
    console.error('\n❌ ERROR - Product Creation Failed');
    console.error(`HTTP Status: ${error.response?.status}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.response?.data) {
      console.error('\nError Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

/**
 * Test 5: Validate response schema for variable product
 */
function validateVariableProductSchema(data) {
  console.log('\n========================================');
  console.log('TEST 5: Validate Response Schema');
  console.log('========================================\n');

  const requiredFields = ['id', 'title', 'handle', 'variants', 'images', 'created_at'];
  const requiredVariantFields = ['id', 'title', 'sku', 'price', 'inventory_quantity'];

  let isValid = true;

  console.log('Checking Product Fields:');
  requiredFields.forEach((field) => {
    const exists = field in data;
    console.log(`  ${exists ? '✅' : '❌'} ${field}: ${exists ? 'Present' : 'Missing'}`);
    if (!exists) isValid = false;
  });

  if (Array.isArray(data.variants) && data.variants.length > 0) {
    console.log('\nChecking Variant Fields (first variant):');
    requiredVariantFields.forEach((field) => {
      const exists = field in data.variants[0];
      console.log(`  ${exists ? '✅' : '❌'} ${field}: ${exists ? 'Present' : 'Missing'}`);
      if (!exists) isValid = false;
    });
  }

  console.log(`\n${isValid ? '✅ All required fields present!' : '❌ Some fields missing'}`);
  return isValid;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 Starting Shopify Variable Product Tests\n');

  try {
    // Test 1: Create variable product
    const productId1 = await testVariableProductCreation();

    // Test 3: Retrieve product with variants
    if (productId1) {
      await testGetProductWithVariants(productId1);
    }

    // Test 2: Create price variant product
    const productId2 = await testPriceVariantProduct();

    // Test 4: Create simple product
    const productId3 = await testSimpleProduct();

    console.log('\n========================================');
    console.log('🎉 All Tests Completed!');
    console.log('========================================');
    console.log(`Created Products:`);
    console.log(`  1. Variable Product (T-Shirt): ${productId1}`);
    console.log(`  2. Price Variant Product (Subscription): ${productId2}`);
    console.log(`  3. Simple Product: ${productId3}`);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests().then(() => {
  console.log('\n✅ Test execution completed\n');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

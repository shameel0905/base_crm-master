/**
 * Test Case: Create Shopify Variable Product (Based on "The Complete Snowboard")
 * This test creates a product with multiple variants using the correct Shopify API structure
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api/shopify';

/**
 * Test: Create Variable Product similar to "The Complete Snowboard"
 */
async function testCreateVariableProduct() {
  console.log('\n========================================');
  console.log('TEST: Create Variable Product - Snowboard');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'Premium Snowboard Collection',
      description: '<p>This is a <b>PREMIUM</b> snowboard with <b>5 color variants</b></p>',
      vendor: 'Premium Snow Sports',
      type: 'Snowboard',
      slug: 'premium-snowboard-collection',
      price: '699.95',
      variants: [
        {
          title: 'Ice',
          sku: 'SNOW-ICE-001',
          price: '699.95',
          inventory_quantity: 10,
          weight: 10.0,
          weight_unit: 'lb',
          grams: 4536,
        },
        {
          title: 'Dawn',
          sku: 'SNOW-DAWN-001',
          price: '699.95',
          inventory_quantity: 10,
          weight: 10.0,
          weight_unit: 'lb',
          grams: 4536,
        },
        {
          title: 'Powder',
          sku: 'SNOW-POWDER-001',
          price: '699.95',
          inventory_quantity: 10,
          weight: 10.0,
          weight_unit: 'lb',
          grams: 4536,
        },
        {
          title: 'Electric',
          sku: 'SNOW-ELECTRIC-001',
          price: '699.95',
          inventory_quantity: 10,
          weight: 10.0,
          weight_unit: 'lb',
          grams: 4536,
        },
        {
          title: 'Sunset',
          sku: 'SNOW-SUNSET-001',
          price: '699.95',
          inventory_quantity: 10,
          weight: 10.0,
          weight_unit: 'lb',
          grams: 4536,
        },
      ],
      images: ['https://cdn.shopify.com/s/files/1/0640/0019/6791/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1711990224'],
    };

    console.log('📤 Request Payload:');
    console.log(JSON.stringify(productData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('\n✅ Response Status:', response.status);
    console.log('\n📥 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.data) {
      console.log('\n✅ Product Created Successfully!');
      console.log(`Product ID: ${response.data.data.id}`);
      console.log(`Product Title: ${response.data.data.title}`);
      console.log(`Variants Count: ${response.data.data.variants?.length || 0}`);

      // Analyze response variants
      if (response.data.data.variants && response.data.data.variants.length > 0) {
        console.log('\n📊 Variants in Response:');
        response.data.data.variants.forEach((variant, idx) => {
          console.log(`  [${idx + 1}] ${variant.title} - SKU: ${variant.sku}, Price: $${variant.price}, Stock: ${variant.inventory_quantity}`);
        });
      }

      return response.data.data.id;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test: Retrieve the created product
 */
async function testRetrieveProduct(productId) {
  console.log(`\n========================================`);
  console.log(`TEST: Retrieve Variable Product (ID: ${productId})`);
  console.log('========================================\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);

    console.log('✅ Product Retrieved Successfully');
    console.log('\n📋 Product Details:');
    console.log(JSON.stringify(response.data.data, null, 2));

    // Validate structure
    if (response.data.data.variants) {
      console.log(`\n✅ Product has ${response.data.data.variants.length} variants`);

      console.log('\n📊 Variant Structure:');
      response.data.data.variants.forEach((v, idx) => {
        console.log(`\n  [Variant ${idx + 1}]`);
        console.log(`    - ID: ${v.id}`);
        console.log(`    - Title: ${v.title}`);
        console.log(`    - SKU: ${v.sku}`);
        console.log(`    - Price: $${v.price}`);
        console.log(`    - Inventory: ${v.inventory_quantity}`);
        console.log(`    - Option1: ${v.option1}`);
        console.log(`    - Weight: ${v.weight} ${v.weight_unit}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test: List all products and verify our new one
 */
async function testListProducts() {
  console.log(`\n========================================`);
  console.log(`TEST: List Products`);
  console.log('========================================\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/products?limit=20`);

    if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`✅ Retrieved ${response.data.data.length} products\n`);

      // Show products with variants
      response.data.data
        .filter(p => p.variants && p.variants.length > 1)
        .slice(0, 5)
        .forEach(p => {
          console.log(`📦 ${p.title}`);
          console.log(`   Variants: ${p.variants.length}`);
          p.variants.slice(0, 3).forEach((v, idx) => {
            console.log(`     [${idx + 1}] ${v.title} - $${v.price}`);
          });
          if (p.variants.length > 3) {
            console.log(`     ... and ${p.variants.length - 3} more`);
          }
          console.log();
        });
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 Starting Shopify Variable Product Test Suite\n');
  console.log('This test creates a product similar to "The Complete Snowboard"');
  console.log('with 5 color variants.\n');

  try {
    // Create product
    const productId = await testCreateVariableProduct();

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retrieve product
    if (productId) {
      await testRetrieveProduct(productId);
    }

    // List products
    await testListProducts();

    console.log('\n========================================');
    console.log('🎉 All Tests Completed Successfully!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

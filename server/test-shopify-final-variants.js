/**
 * COMPREHENSIVE SHOPIFY VARIABLE PRODUCT TEST
 * ============================================
 * 
 * Tests all three scenarios:
 * 1. Single-option product (Color only)
 * 2. Two-option product (Size + Color) 
 * 3. Three-option product (Size + Color + Material)
 * 
 * Based on "The Complete Snowboard" structure from Shopify
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api/shopify';

/**
 * TEST 1: Single-Option Product (Color)
 * ✅ Successfully tested - works as-is
 */
async function testSingleOptionProduct() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: SINGLE-OPTION VARIABLE PRODUCT (Color)');
  console.log('='.repeat(70) + '\n');

  try {
    const timestamp = Date.now();
    const colors = ['Ice', 'Dawn', 'Powder', 'Electric', 'Sunset'];
    
    const productData = {
      title: `The Complete Snowboard ${timestamp}`,
      description: '<p>This <b>PREMIUM</b> snowboard comes in 5 stunning colors.</p>',
      vendor: 'Snowboard Vendor',
      type: 'snowboard',
      slug: `complete-snowboard-${timestamp}`,
      price: '699.95',
      // IMPORTANT: For multi-variant products, define options array FIRST
      options: [
        {
          name: 'Color',
          position: 1,
          values: colors,
        },
      ],
      // Then variants reference option values using option1, option2, option3
      variants: [
        { option1: 'Ice', sku: `SNOW-ICE-${timestamp}`, price: '699.95', inventory_quantity: 10 },
        { option1: 'Dawn', sku: `SNOW-DAWN-${timestamp}`, price: '699.95', inventory_quantity: 12 },
        { option1: 'Powder', sku: `SNOW-POWDER-${timestamp}`, price: '699.95', inventory_quantity: 8 },
        { option1: 'Electric', sku: `SNOW-ELEC-${timestamp}`, price: '699.95', inventory_quantity: 15 },
        { option1: 'Sunset', sku: `SNOW-SUNSET-${timestamp}`, price: '699.95', inventory_quantity: 10 },
      ],
      images: ['https://cdn.shopify.com/s/files/1/0640/0019/6791/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg'],
    };

    console.log('📤 Creating product with 5 color variants...\n');
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    const product = response.data.data;
    console.log('✅ SUCCESS!\n');
    console.log(`Product ID: ${product.id}`);
    console.log(`Title: ${product.title}`);
    console.log(`Variants: ${product.variants.length}`);
    console.log(`Vendor: ${product.vendor}\n`);

    console.log('📊 Variants Summary:');
    product.variants.forEach((v, i) => {
      console.log(`  [${i + 1}] ${v.title} | SKU: ${v.sku} | Price: $${v.price} | Stock: ${v.inventory_quantity}`);
    });

    return product;
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * TEST 2: Two-Option Product (Size + Color)
 */
async function testTwoOptionProduct() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: TWO-OPTION VARIABLE PRODUCT (Size + Color)');
  console.log('='.repeat(70) + '\n');

  try {
    const timestamp = Date.now();
    const productData = {
      title: `Premium T-Shirt Deluxe ${timestamp}`,
      description: '<p>Available in 3 sizes and 3 colors for maximum flexibility.</p>',
      vendor: 'Fashion Co.',
      type: 'Apparel',
      slug: `premium-tshirt-${timestamp}`,
      price: '29.99',
      // ⭐ CRITICAL: Must include explicit options for multi-option products
      options: [
        {
          name: 'Size',
          position: 1,
          values: ['Small', 'Medium', 'Large'],
        },
        {
          name: 'Color',
          position: 2,
          values: ['Black', 'White', 'Red'],
        },
      ],
      // 9 variants = 3 sizes × 3 colors
      variants: [
        { sku: `TSHIRT-S-BLK-${timestamp}`, price: '29.99', inventory_quantity: 20, option1: 'Small', option2: 'Black', option3: null },
        { sku: `TSHIRT-S-WHT-${timestamp}`, price: '29.99', inventory_quantity: 25, option1: 'Small', option2: 'White', option3: null },
        { sku: `TSHIRT-S-RED-${timestamp}`, price: '34.99', inventory_quantity: 15, option1: 'Small', option2: 'Red', option3: null },
        { sku: `TSHIRT-M-BLK-${timestamp}`, price: '29.99', inventory_quantity: 30, option1: 'Medium', option2: 'Black', option3: null },
        { sku: `TSHIRT-M-WHT-${timestamp}`, price: '29.99', inventory_quantity: 35, option1: 'Medium', option2: 'White', option3: null },
        { sku: `TSHIRT-M-RED-${timestamp}`, price: '34.99', inventory_quantity: 25, option1: 'Medium', option2: 'Red', option3: null },
        { sku: `TSHIRT-L-BLK-${timestamp}`, price: '29.99', inventory_quantity: 25, option1: 'Large', option2: 'Black', option3: null },
        { sku: `TSHIRT-L-WHT-${timestamp}`, price: '29.99', inventory_quantity: 30, option1: 'Large', option2: 'White', option3: null },
        { sku: `TSHIRT-L-RED-${timestamp}`, price: '34.99', inventory_quantity: 20, option1: 'Large', option2: 'Red', option3: null },
      ],
    };

    console.log('📤 Creating product with 9 variants (3 sizes × 3 colors)...\n');
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    const product = response.data.data;
    console.log('✅ SUCCESS!\n');
    console.log(`Product ID: ${product.id}`);
    console.log(`Title: ${product.title}`);
    console.log(`Variants: ${product.variants.length}`);
    console.log(`Options: ${product.options?.length || 0}\n`);

    if (product.options && product.options.length > 0) {
      console.log('📍 Options:');
      product.options.forEach(opt => {
        console.log(`  - ${opt.name}: ${opt.values.join(', ')}`);
      });
      console.log();
    }

    console.log('📊 Variant Matrix:');
    const sizes = ['Small', 'Medium', 'Large'];
    const colors = ['Black', 'White', 'Red'];
    console.log('         ' + colors.map(c => c.padEnd(10)).join(''));
    sizes.forEach(size => {
      const row = product.variants
        .filter(v => v.option1 === size)
        .map(v => `$${v.price}`.padEnd(10))
        .join('');
      console.log(`${size.padEnd(8)} ${row}`);
    });

    return product;
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * TEST 3: Three-Option Product (Size + Color + Material)
 */
async function testThreeOptionProduct() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: THREE-OPTION VARIABLE PRODUCT (Size + Color + Material)');
  console.log('='.repeat(70) + '\n');

  try {
    const timestamp = Date.now();
    const productData = {
      title: `Premium Athletic Wear Pro ${timestamp}`,
      description: '<p>Ultimate customization with size, color, and material choices.</p>',
      vendor: 'Performance Sports',
      type: 'Athletic',
      slug: `premium-athletic-${timestamp}`,
      price: '49.99',
      options: [
        {
          name: 'Size',
          position: 1,
          values: ['Small', 'Large'],
        },
        {
          name: 'Color',
          position: 2,
          values: ['Blue', 'Green'],
        },
        {
          name: 'Material',
          position: 3,
          values: ['Cotton', 'Polyester'],
        },
      ],
      // 8 variants = 2 sizes × 2 colors × 2 materials
      variants: [
        { sku: `ATHLETIC-S-BLU-CTN-${timestamp}`, price: '49.99', inventory_quantity: 15, option1: 'Small', option2: 'Blue', option3: 'Cotton' },
        { sku: `ATHLETIC-S-BLU-PLY-${timestamp}`, price: '44.99', inventory_quantity: 12, option1: 'Small', option2: 'Blue', option3: 'Polyester' },
        { sku: `ATHLETIC-S-GRN-CTN-${timestamp}`, price: '49.99', inventory_quantity: 18, option1: 'Small', option2: 'Green', option3: 'Cotton' },
        { sku: `ATHLETIC-S-GRN-PLY-${timestamp}`, price: '44.99', inventory_quantity: 10, option1: 'Small', option2: 'Green', option3: 'Polyester' },
        { sku: `ATHLETIC-L-BLU-CTN-${timestamp}`, price: '49.99', inventory_quantity: 20, option1: 'Large', option2: 'Blue', option3: 'Cotton' },
        { sku: `ATHLETIC-L-BLU-PLY-${timestamp}`, price: '44.99', inventory_quantity: 16, option1: 'Large', option2: 'Blue', option3: 'Polyester' },
        { sku: `ATHLETIC-L-GRN-CTN-${timestamp}`, price: '49.99', inventory_quantity: 22, option1: 'Large', option2: 'Green', option3: 'Cotton' },
        { sku: `ATHLETIC-L-GRN-PLY-${timestamp}`, price: '44.99', inventory_quantity: 14, option1: 'Large', option2: 'Green', option3: 'Polyester' },
      ],
    };

    console.log('📤 Creating product with 8 variants (2 sizes × 2 colors × 2 materials)...\n');
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    const product = response.data.data;
    console.log('✅ SUCCESS!\n');
    console.log(`Product ID: ${product.id}`);
    console.log(`Title: ${product.title}`);
    console.log(`Variants: ${product.variants.length}`);
    console.log(`Options: ${product.options?.length || 0}\n`);

    if (product.options && product.options.length > 0) {
      console.log('📍 Options:');
      product.options.forEach(opt => {
        console.log(`  - ${opt.name}: ${opt.values.join(', ')}`);
      });
      console.log();
    }

    console.log('📊 Sample Variants (first 4):');
    product.variants.slice(0, 4).forEach((v, i) => {
      console.log(`  [${i + 1}] Size:${v.option1} | Color:${v.option2} | Material:${v.option3} | Price:$${v.price} | SKU:${v.sku}`);
    });
    console.log(`  ... and ${product.variants.length - 4} more variants`);

    return product;
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  SHOPIFY VARIABLE PRODUCT TEST SUITE'.padEnd(69) + '█');
  console.log('█' + '  Based on "The Complete Snowboard" Product Structure'.padEnd(69) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70) + '\n');

  try {
    // Run all three tests
    const product1 = await testSingleOptionProduct();
    await new Promise(r => setTimeout(r, 1000));

    const product2 = await testTwoOptionProduct();
    await new Promise(r => setTimeout(r, 1000));

    const product3 = await testThreeOptionProduct();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(70) + '\n');

    console.log('✅ TEST 1: Single-Option Product');
    console.log(`   Product ID: ${product1.id}`);
    console.log(`   Variants: ${product1.variants.length}`);
    console.log(`   Status: ✅ PASSED\n`);

    console.log('✅ TEST 2: Two-Option Product');
    console.log(`   Product ID: ${product2.id}`);
    console.log(`   Variants: ${product2.variants.length}`);
    console.log(`   Options: ${product2.options?.length || 0}`);
    console.log(`   Status: ✅ PASSED\n`);

    console.log('✅ TEST 3: Three-Option Product');
    console.log(`   Product ID: ${product3.id}`);
    console.log(`   Variants: ${product3.variants.length}`);
    console.log(`   Options: ${product3.options?.length || 0}`);
    console.log(`   Status: ✅ PASSED\n`);

    console.log('='.repeat(70));
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('='.repeat(70) + '\n');

    console.log('📝 KEY LEARNINGS:\n');
    console.log('1. Single-option products work automatically (Shopify auto-creates "Title" option)');
    console.log('2. Multi-option products REQUIRE explicit `options` array in request');
    console.log('3. Each variant must map to option values via option1, option2, option3');
    console.log('4. SKU should be unique per variant combination');
    console.log('5. Prices can vary per variant');
    console.log('6. Inventory is tracked independently per variant\n');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

// Execute
runAllTests().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

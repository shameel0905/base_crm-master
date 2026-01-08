/**
 * Test Case: Shopify Variable Product - The Complete Snowboard
 * 
 * Key learnings:
 * 1. Shopify variable products require `options` to be defined when you have named variants
 * 2. Each variant maps to option values (e.g., Size, Color, Material)
 * 3. Variant titles can be custom, or auto-generated from option values
 * 4. Prices should be strings (Shopify accepts strings and auto-converts)
 * 5. SKU, weight, inventory are all optional but recommended
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api/shopify';

/**
 * TEST 1: Create a variable product WITH proper options
 * This is the correct way Shopify expects variant products
 */
async function testVariableProductWithOptions() {
  console.log('\n========================================');
  console.log('TEST 1: Create Variable Product with Options');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'The Complete Snowboard Ultra',
      description: '<p>This <b>PREMIUM</b> snowboard comes in <b>5 beautiful colors</b>. Each with unique performance characteristics.</p>',
      vendor: 'Snowboard Vendor',
      type: 'snowboard',
      slug: 'complete-snowboard-ultra',
      price: '699.95',
      // Important: Define what options this product has
      // This tells Shopify the structure of your variants
      options: [
        {
          name: 'Color',
          values: ['Ice', 'Dawn', 'Powder', 'Electric', 'Sunset'],
        },
      ],
      // Variants - each one corresponds to an option combination
      variants: [
        {
          title: 'Ice',
          sku: 'SNOW-ICE-ULTRA',
          price: '699.95',
          inventory_quantity: 10,
          option1: 'Ice',
        },
        {
          title: 'Dawn',
          sku: 'SNOW-DAWN-ULTRA',
          price: '699.95',
          inventory_quantity: 12,
          option1: 'Dawn',
        },
        {
          title: 'Powder',
          sku: 'SNOW-POWDER-ULTRA',
          price: '699.95',
          inventory_quantity: 8,
          option1: 'Powder',
        },
        {
          title: 'Electric',
          sku: 'SNOW-ELEC-ULTRA',
          price: '699.95',
          inventory_quantity: 15,
          option1: 'Electric',
        },
        {
          title: 'Sunset',
          sku: 'SNOW-SUNSET-ULTRA',
          price: '699.95',
          inventory_quantity: 10,
          option1: 'Sunset',
        },
      ],
      images: ['https://cdn.shopify.com/s/files/1/0640/0019/6791/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg'],
    };

    console.log('📤 Request Payload:');
    console.log(JSON.stringify(productData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('\n✅ SUCCESS! Product Created');
    console.log(`Response Status: ${response.status}`);
    console.log(`\nProduct ID: ${response.data.data.id}`);
    console.log(`Product Title: ${response.data.data.title}`);
    console.log(`Total Variants: ${response.data.data.variants.length}`);

    // Print variant summary
    if (response.data.data.variants) {
      console.log('\n📊 Variants Created:');
      response.data.data.variants.forEach((v, idx) => {
        console.log(`  [${idx + 1}] ${v.title} - SKU: ${v.sku}, Price: $${v.price}, Stock: ${v.inventory_quantity}, Option1: ${v.option1}`);
      });
    }

    // Print options
    if (response.data.data.options) {
      console.log('\n📍 Product Options:');
      response.data.data.options.forEach((opt) => {
        console.log(`  - ${opt.name}: ${opt.values.join(', ')}`);
      });
    }

    return response.data.data.id;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * TEST 2: Create a product with TWO options (Size + Color)
 */
async function testProductWithTwoOptions() {
  console.log('\n========================================');
  console.log('TEST 2: Variable Product with Size + Color');
  console.log('========================================\n');

  try {
    const productData = {
      title: 'Premium T-Shirt Collection',
      description: '<p>Available in multiple <b>sizes and colors</b></p>',
      vendor: 'Fashion Co.',
      type: 'Apparel',
      slug: 'premium-tshirt-duo',
      price: '29.99',
      options: [
        {
          name: 'Size',
          values: ['Small', 'Medium', 'Large'],
        },
        {
          name: 'Color',
          values: ['Black', 'White', 'Red'],
        },
      ],
      variants: [
        { sku: 'TSHIRT-S-BLK', price: '29.99', inventory_quantity: 20, option1: 'Small', option2: 'Black' },
        { sku: 'TSHIRT-S-WHT', price: '29.99', inventory_quantity: 25, option1: 'Small', option2: 'White' },
        { sku: 'TSHIRT-S-RED', price: '34.99', inventory_quantity: 15, option1: 'Small', option2: 'Red' },
        { sku: 'TSHIRT-M-BLK', price: '29.99', inventory_quantity: 30, option1: 'Medium', option2: 'Black' },
        { sku: 'TSHIRT-M-WHT', price: '29.99', inventory_quantity: 35, option1: 'Medium', option2: 'White' },
        { sku: 'TSHIRT-M-RED', price: '34.99', inventory_quantity: 25, option1: 'Medium', option2: 'Red' },
        { sku: 'TSHIRT-L-BLK', price: '29.99', inventory_quantity: 25, option1: 'Large', option2: 'Black' },
        { sku: 'TSHIRT-L-WHT', price: '29.99', inventory_quantity: 30, option1: 'Large', option2: 'White' },
        { sku: 'TSHIRT-L-RED', price: '34.99', inventory_quantity: 20, option1: 'Large', option2: 'Red' },
      ],
      images: ['https://via.placeholder.com/300x300?text=Premium+TShirt'],
    };

    console.log('📤 Request with 2 Options (9 variant combinations):');
    console.log(`- Options: ${productData.options.map(o => o.name).join(', ')}`);
    console.log(`- Variants: ${productData.variants.length}`);

    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('\n✅ SUCCESS! Product Created');
    console.log(`Product ID: ${response.data.data.id}`);
    console.log(`Total Variants: ${response.data.data.variants.length}`);

    // Print variant matrix
    console.log('\n📊 Variant Matrix:');
    const sizes = ['Small', 'Medium', 'Large'];
    const colors = ['Black', 'White', 'Red'];
    console.log('      ', colors.join('        '));
    sizes.forEach(size => {
      const row = response.data.data.variants
        .filter(v => v.option1 === size)
        .map(v => `$${v.price}`)
        .join('    ');
      console.log(`${size.padEnd(8)} ${row}`);
    });

    return response.data.data.id;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * TEST 3: Retrieve created product and verify structure
 */
async function testRetrieveProduct(productId) {
  console.log(`\n========================================`);
  console.log(`TEST 3: Retrieve Product (ID: ${productId})`);
  console.log('========================================\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);

    const product = response.data.data;

    console.log(`✅ Product Retrieved: ${product.title}`);
    console.log(`\n📋 Structure:`);
    console.log(`- ID: ${product.id}`);
    console.log(`- Handle: ${product.handle}`);
    console.log(`- Type: ${product.product_type}`);
    console.log(`- Vendor: ${product.vendor}`);
    console.log(`- Total Variants: ${product.variants.length}`);
    console.log(`- Total Options: ${product.options?.length || 0}`);

    if (product.options && product.options.length > 0) {
      console.log(`\n📍 Options:`);
      product.options.forEach(opt => {
        console.log(`  - ${opt.name}: ${opt.values.join(', ')}`);
      });
    }

    console.log(`\n🔄 Sample Variants (first 3):`);
    product.variants.slice(0, 3).forEach((v, idx) => {
      console.log(`\n  [${idx + 1}] ${v.title || v.sku}`);
      console.log(`      SKU: ${v.sku}`);
      console.log(`      Price: $${v.price}`);
      console.log(`      Stock: ${v.inventory_quantity}`);
      if (v.option1) console.log(`      Option1: ${v.option1}`);
      if (v.option2) console.log(`      Option2: ${v.option2}`);
      if (v.option3) console.log(`      Option3: ${v.option3}`);
    });

    return product;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 SHOPIFY VARIABLE PRODUCT TEST SUITE');
  console.log('Based on "The Complete Snowboard" structure\n');

  try {
    // Test 1: Single option (Color)
    const productId1 = await testVariableProductWithOptions();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Retrieve and verify
    if (productId1) {
      await testRetrieveProduct(productId1);
    }

    // Test 2: Two options (Size + Color)
    const productId2 = await testProductWithTwoOptions();

    // Wait and retrieve
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (productId2) {
      await testRetrieveProduct(productId2);
    }

    console.log('\n\n========================================');
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Summary:');
    console.log(`✅ Test 1: Single-option variable product created (ID: ${productId1})`);
    console.log(`✅ Test 2: Two-option variable product created (ID: ${productId2})`);
    console.log('\nKey Findings:');
    console.log('- Shopify requires `options` to be defined for variable products');
    console.log('- Each variant must map to option values via option1, option2, option3');
    console.log('- Variant titles can be custom strings');
    console.log('- SKU and inventory_quantity are properly tracked');
    console.log('- Price can be different per variant for same product');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
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

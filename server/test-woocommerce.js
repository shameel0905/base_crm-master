const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
require('dotenv').config();

// Test WooCommerce connection
async function testWooCommerceConnection() {
  console.log('Testing WooCommerce connection...');
  console.log('WC_STORE:', process.env.WC_STORE);
  console.log('WC_CONSUMER_KEY:', process.env.WC_CONSUMER_KEY ? 'Set' : 'Not set');
  console.log('WC_CONSUMER_SECRET:', process.env.WC_CONSUMER_SECRET ? 'Set' : 'Not set');
  
  try {
    const WooCommerce = new WooCommerceRestApi({
      url: `https://${process.env.WC_STORE}`,
      consumerKey: process.env.WC_CONSUMER_KEY,
      consumerSecret: process.env.WC_CONSUMER_SECRET,
      version: "wc/v3",
      queryStringAuth: true // Force Basic Authentication as query string
    });

    console.log('Making test request to WooCommerce API...');
    const response = await WooCommerce.get("products", { per_page: 1 });
    
    console.log('✅ WooCommerce connection successful!');
    console.log('Response status:', response.status);
    console.log('Total products:', response.headers['x-wp-total'] || 'Unknown');
    console.log('WooCommerce version:', response.headers['x-wc-version'] || 'Unknown');
    
    return true;
  } catch (error) {
    console.log('❌ WooCommerce connection failed!');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    
    return false;
  }
}

testWooCommerceConnection();
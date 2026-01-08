const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// Create an API client instance
const api = new WooCommerceRestApi({
  url: process.env.WC_STORE,            
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: "wc/v3",
  axiosConfig: {
    headers: {
      'User-Agent': 'BaseCRM-WooCommerce/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});


// Get all products
async function getProducts(params = {}) {
  const res = await api.get("products", params);
  return res.data;
}

// Get single product
async function getProduct(id) {
  const res = await api.get(`products/${id}`);
  return res.data;
}

// Create new product
async function createProduct(product) {
  const res = await api.post("products", product);
  return res.data;
}

// Update product
async function updateProduct(id, product) {
  const res = await api.put(`products/${id}`, product);
  return res.data;
}

// Delete product
async function deleteProduct(id, force = true) {
  const res = await api.delete(`products/${id}`, { force });
  return res.data;
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };

/**
 * Shopify E-commerce Service
 * Handles all Shopify API calls for products, orders, and customers
 */

const API_BASE_URL = 'http://localhost:3001/api/shopify';
const REQUEST_TIMEOUT = 15000; // 15 second timeout

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT}ms - Shopify server may be slow or unreachable`);
    }
    throw error;
  }
}

// Helper function to handle API responses
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }
  
  return data;
}

// ==================== PRODUCTS ====================

/**
 * Get all products from Shopify
 * @param {Object} params - Query parameters (limit, search, etc)
 * @returns {Promise} Response with products array
 */
async function getAllProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/products${queryString ? '?' + queryString : ''}`;
  
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

/**
 * Get single product by ID
 * @param {string|number} id - Product ID
 * @returns {Promise} Product object
 */
async function getProductById(id) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

/**
 * Create new product
 * @param {Object} product - Product data
 * @returns {Promise} Created product
 */
async function createProduct(product) {
  const url = `${API_BASE_URL}/products`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return handleResponse(response);
}

/**
 * Update existing product
 * @param {string|number} id - Product ID
 * @param {Object} product - Updated product data
 * @returns {Promise} Updated product
 */
async function updateProduct(id, product) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetchWithTimeout(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return handleResponse(response);
}

/**
 * Delete product
 * @param {string|number} id - Product ID
 * @returns {Promise} Deletion result
 */
async function deleteProduct(id) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
}

// ==================== VARIANTS ====================

/**
 * Get variants for a product
 * @param {string|number} productId - Product ID
 * @returns {Promise} Array of variants
 */
async function getVariants(productId) {
  const url = `${API_BASE_URL}/products/${productId}/variants`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

/**
 * Create variant
 * @param {string|number} productId - Product ID
 * @param {Object} variant - Variant data
 * @returns {Promise} Created variant
 */
async function createVariant(productId, variant) {
  const url = `${API_BASE_URL}/products/${productId}/variants`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variant),
  });
  return handleResponse(response);
}

/**
 * Update variant
 * @param {string|number} productId - Product ID
 * @param {string|number} variantId - Variant ID
 * @param {Object} variant - Updated variant data
 * @returns {Promise} Updated variant
 */
async function updateVariant(productId, variantId, variant) {
  const url = `${API_BASE_URL}/products/${productId}/variants/${variantId}`;
  const response = await fetchWithTimeout(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variant),
  });
  return handleResponse(response);
}

/**
 * Delete variant
 * @param {string|number} productId - Product ID
 * @param {string|number} variantId - Variant ID
 * @returns {Promise} Deletion result
 */
async function deleteVariant(productId, variantId) {
  const url = `${API_BASE_URL}/products/${productId}/variants/${variantId}`;
  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
}

// ==================== ORDERS ====================

/**
 * Get all orders
 * @param {Object} params - Query parameters (limit, page, etc)
 * @returns {Promise} Orders array
 */
async function getAllOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/orders${queryString ? '?' + queryString : ''}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

/**
 * Get single order
 * @param {string|number} id - Order ID
 * @returns {Promise} Order object
 */
async function getOrderById(id) {
  const url = `${API_BASE_URL}/orders/${id}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

// ==================== CUSTOMERS ====================

/**
 * Get all customers
 * @param {Object} params - Query parameters (limit, etc)
 * @returns {Promise} Customers array
 */
async function getAllCustomers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/customers${queryString ? '?' + queryString : ''}`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

// ==================== CONNECTION TEST ====================

/**
 * Test Shopify API connection
 * @returns {Promise} Connection test result
 */
async function testConnection() {
  const url = `${API_BASE_URL}/test`;
  const response = await fetchWithTimeout(url);
  return handleResponse(response);
}

// Export all functions
export default {
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Variants
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  
  // Orders
  getAllOrders,
  getOrderById,

  // Collections
  async getCollections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/collections${queryString ? '?' + queryString : ''}`;
    const response = await fetchWithTimeout(url);
    return handleResponse(response);
  },
  async getCollectionById(id) {
    const url = `${API_BASE_URL}/collections/${id}`;
    const response = await fetchWithTimeout(url);
    return handleResponse(response);
  },
  async createCollection(collection) {
    const url = `${API_BASE_URL}/collections`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collection),
    });
    return handleResponse(response);
  },
  async updateCollection(id, collection) {
    const url = `${API_BASE_URL}/collections/${id}`;
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collection),
    });
    return handleResponse(response);
  },
  async getCollects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/collects${queryString ? '?' + queryString : ''}`;
    const response = await fetchWithTimeout(url);
    return handleResponse(response);
  },
  async createCollect(collect) {
    const url = `${API_BASE_URL}/collects`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collect),
    });
    return handleResponse(response);
  },
  async deleteCollect(id) {
    const url = `${API_BASE_URL}/collects/${id}`;
    const response = await fetchWithTimeout(url, { method: 'DELETE' });
    return handleResponse(response);
  },
  async deleteCollection(id) {
    const url = `${API_BASE_URL}/collections/${id}`;
    const response = await fetchWithTimeout(url, { method: 'DELETE' });
    return handleResponse(response);
  },
  
  // Customers
  getAllCustomers,
  
  // Connection
  testConnection,
};

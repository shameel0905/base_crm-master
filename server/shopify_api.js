const https = require('https');
require('dotenv').config();

// Validate required environment variables
if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN || !process.env.SHOPIFY_API_VERSION) {
  console.error('ERROR: Missing required Shopify environment variables!');
  console.error('Required: SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN, SHOPIFY_API_VERSION');
  process.exit(1);
}

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

console.log(`[Shopify] Initializing with store: ${SHOPIFY_STORE}`);

/**
 * Make HTTP request to Shopify Admin API
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API endpoint path
 * @param {Object} data - Request body (for POST/PUT)
 * @returns {Promise<Object>} - Response data
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Ensure path starts with /
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
      timeout: 10000, // 10s timeout to prevent indefinite hanging
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
            console.error(`[Shopify API] Error ${res.statusCode} Response:`, JSON.stringify(parsedData, null, 2));
            const error = new Error(`Shopify API Error: ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.data = parsedData;
            reject(error);
          }
        } catch (err) {
          reject(new Error(`Failed to parse Shopify response: ${err.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Shopify API request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Shopify API request timeout after 10s: ${method} ${options.path}`));
    });

    if (data) {
      try {
        console.log('[Shopify API] Request Payload:', JSON.stringify(data));
      } catch (e) { /* ignore */ }
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Retry wrapper with minimal backoff (100ms, 200ms)
 */
async function retryRequest(method, path, data = null, maxRetries = 2) {
  let attempt = 0;
  let lastError;
  const startTime = Date.now();

  while (attempt < maxRetries) {
    try {
      const result = await makeRequest(method, path, data);
      const duration = Date.now() - startTime;
      console.log(`[Shopify] ✓ ${method} ${path} completed in ${duration}ms`);
      return result;
    } catch (error) {
      attempt++;
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = attempt * 100; // 100ms, 200ms (much faster than exponential 1s, 2s, 4s)
        console.warn(`[Shopify] Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  console.error(`[Shopify] ✗ ${method} ${path} failed after ${totalDuration}ms (${maxRetries} attempts):`, lastError.message);
  throw lastError;
}

// ==================== PRODUCTS ====================

/**
 * Get all products from Shopify
 */
async function getProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = `/products.json${queryString ? '?' + queryString : ''}`;
  const response = await retryRequest('GET', path);
  return response.products || [];
}

/**
 * Get single product by ID
 */
async function getProduct(id) {
  const response = await retryRequest('GET', `/products/${id}.json`);
  return response.product;
}

/**
 * Create new product
 */
async function createProduct(product) {
  const response = await retryRequest('POST', '/products.json', { product });
  return response.product;
}

/**
 * Update product
 */
async function updateProduct(id, product) {
  const response = await retryRequest('PUT', `/products/${id}.json`, { product });
  return response.product;
}

/**
 * Delete product
 */
async function deleteProduct(id) {
  await retryRequest('DELETE', `/products/${id}.json`);
  return { success: true };
}

// ==================== ORDERS ====================

/**
 * Get all orders from Shopify
 */
async function getOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = `/orders.json${queryString ? '?' + queryString : ''}`;
  const response = await retryRequest('GET', path);
  return response.orders || [];
}

/**
 * Get single order by ID
 */
async function getOrder(id) {
  const response = await retryRequest('GET', `/orders/${id}.json`);
  return response.order;
}

/**
 * Get all customers
 */
async function getCustomers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = `/customers.json${queryString ? '?' + queryString : ''}`;
  const response = await retryRequest('GET', path);
  return response.customers || [];
}

/**
 * Get single customer by ID
 */
async function getCustomer(id) {
  const response = await retryRequest('GET', `/customers/${id}.json`);
  return response.customer;
}

// ==================== COLLECTIONS ====================

/**
 * Get all collections (optimized)
 */
async function getCollections(params = {}) {
  const queryString = new URLSearchParams(params).toString();

  // Shopify exposes collections as two different resources:
  // - custom_collections (user-created, more common)
  // - smart_collections (automated based on rules)
  // Fetch custom first as it's most common; only fall back to smart if custom fails

  try {
    // Try custom_collections first (most common use case)
    console.log('[Shopify API] Fetching custom collections...');
    const customPath = `/custom_collections.json${queryString ? '?' + queryString : ''}`;
    const response = await retryRequest('GET', customPath);
    const customCollections = response.custom_collections || [];
    console.log(`[Shopify API] Got ${customCollections.length} custom collections`);
    return customCollections;
  } catch (err) {
    // If custom collections fail, try smart collections as fallback
    if (err && err.statusCode === 404) {
      console.warn('[Shopify API] Custom collections not available, trying smart collections...');
      try {
        const smartPath = `/smart_collections.json${queryString ? '?' + queryString : ''}`;
        const response = await retryRequest('GET', smartPath);
        const smartCollections = response.smart_collections || [];
        console.log(`[Shopify API] Got ${smartCollections.length} smart collections`);
        return smartCollections;
      } catch (err2) {
        console.error('[Shopify API] Smart collections also failed:', err2.message);
        return [];
      }
    }
    // For other errors, return empty list instead of crashing
    console.error('[Shopify API] Error fetching collections:', err.message);
    return [];
  }
}

/**
 * Get collection by ID
 */
async function getCollection(id) {
  // Try custom collection first, then smart collection
  try {
    const res = await retryRequest('GET', `/custom_collections/${id}.json`);
    return res.custom_collection || res.collection || null;
  } catch (err) {
    if (err && err.statusCode === 404) {
      // try smart collections
      try {
        const res2 = await retryRequest('GET', `/smart_collections/${id}.json`);
        return res2.smart_collection || res2.collection || null;
      } catch (err2) {
        // not found or other error
        throw err2;
      }
    }
    throw err;
  }
}

/**
 * Create a new collection (custom collection)
 */
async function createCollection(collection) {
  // Shopify uses custom_collections for simple collection creation
  const response = await retryRequest('POST', '/custom_collections.json', { custom_collection: collection });
  return response.custom_collection || response.collection;
}

/**
 * Update a collection
 */
async function updateCollection(id, collection) {
  // Shopify uses custom_collections for updates
  const response = await retryRequest('PUT', `/custom_collections/${id}.json`, { custom_collection: collection });
  return response.custom_collection || response.collection;
}

/**
 * Delete a collection
 */
async function deleteCollection(id) {
  await retryRequest('DELETE', `/custom_collections/${id}.json`);
  return { success: true };
}

// ==================== VARIANTS ====================

/**
 * Get variants for a product
 */
async function getVariants(productId) {
  const response = await retryRequest('GET', `/products/${productId}/variants.json`);
  return response.variants || [];
}

/**
 * Get single variant
 */
async function getVariant(productId, variantId) {
  const response = await retryRequest('GET', `/products/${productId}/variants/${variantId}.json`);
  return response.variant;
}

// ==================== COLLECTS ====================

/**
 * Get collects (links between products and custom_collections)
 */
async function getCollects(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = `/collects.json${queryString ? '?' + queryString : ''}`;
  const response = await retryRequest('GET', path);
  return response.collects || [];
}

/**
 * Create a collect (link a product to a custom collection)
 */
async function createCollect(collect) {
  // collect must include product_id and collection_id
  const response = await retryRequest('POST', '/collects.json', { collect });
  return response.collect;
}

/**
 * Delete a collect by ID
 */
async function deleteCollect(id) {
  await retryRequest('DELETE', `/collects/${id}.json`);
  return { success: true };
}

/**
 * Create variant
 */
async function createVariant(productId, variant) {
  const response = await retryRequest('POST', `/products/${productId}/variants.json`, { variant });
  return response.variant;
}

/**
 * Update variant
 */
async function updateVariant(productId, variantId, variant) {
  const response = await retryRequest('PUT', `/products/${productId}/variants/${variantId}.json`, { variant });
  return response.variant;
}

/**
 * Delete variant
 */
async function deleteVariant(productId, variantId) {
  await retryRequest('DELETE', `/products/${productId}/variants/${variantId}.json`);
  return { success: true };
}

module.exports = {
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Orders
  getOrders,
  getOrder,
  
  // Customers
  getCustomers,
  getCustomer,
  
  // Collections
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  
  // Variants
  getVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
};

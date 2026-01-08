const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
require('dotenv').config();

// Validate required environment variables
if (!process.env.WC_STORE || !process.env.WC_CONSUMER_KEY || !process.env.WC_CONSUMER_SECRET) {
  console.error('ERROR: Missing required WooCommerce environment variables!');
  console.error('Required: WC_STORE, WC_CONSUMER_KEY, WC_CONSUMER_SECRET');
  process.exit(1);
}

// Construct URL - detect if protocol is already present
let storeUrl = process.env.WC_STORE;
if (!storeUrl.startsWith('http://') && !storeUrl.startsWith('https://')) {
  storeUrl = `https://${storeUrl}`;
}

console.log(`[WooCommerce] Connecting to: ${storeUrl}`);

// Retry helper with exponential backoff
async function makeRequest(method, endpoint, params = null, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let response;
      if (method === 'get') {
        response = await WooCommerce.get(endpoint, params);
      } else if (method === 'post') {
        response = await WooCommerce.post(endpoint, params);
      } else if (method === 'put') {
        response = await WooCommerce.put(endpoint, params);
      } else if (method === 'delete') {
        response = await WooCommerce.delete(endpoint, params);
      }
      
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      
      if (isLastAttempt) {
        throw error;
      }
      
      console.warn(`[WooCommerce] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
const WooCommerce = new WooCommerceRestApi({
  url: storeUrl,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: "wc/v3",
  queryStringAuth: false, // Use OAuth 1.0a for HTTPS (more secure and reliable)
  timeout: 30000, // 30 second timeout
  axiosConfig: {
    headers: {
      'User-Agent': 'BaseCRM-WooCommerce/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    validateStatus: function (status) {
      return status < 500; // Accept all status codes below 500
    }
  }
});

// Simple in-memory cache for orders: key -> { data, expiresAt }
// Key format: orders:page:per_page
const ordersCache = new Map();
// Default TTL for cached pages (ms)
const ORDERS_CACHE_TTL = parseInt(process.env.ORDERS_CACHE_TTL_MS || '60000', 10); // 60s default

async function warmOrderCache(pages = 3, per_page = 50) {
  const results = [];
  for (let page = 1; page <= pages; page++) {
    const key = `orders:page:${page}:per_page:${per_page}`;
    try {
      const response = await makeRequest('get', 'orders', { page, per_page });
      const payload = {
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || response.data.length),
        total_pages: parseInt(response.headers['x-wp-totalpages'] || 1),
      };
      ordersCache.set(key, { payload, expiresAt: Date.now() + ORDERS_CACHE_TTL });
      results.push({ page, count: response.data.length });
    } catch (err) {
      console.warn(`[CacheWarm] Failed to warm page ${page}:`, err.message || err);
      // continue warming other pages
    }
  }
  return results;
}

/**
 * Fetch all products from WooCommerce
 * GET /api/woocommerce/products
 */
async function getAllProducts(req, res) {
  try {
    const { page = 1, per_page = 100, search = '' } = req.query;
    
    const params = {
      page: parseInt(page),
      per_page: parseInt(per_page),
    };
    
    if (search) {
      params.search = search;
    }

    const response = await makeRequest('get', "products", params);
    
    // Validate response is array (not HTML error page)
    if (!Array.isArray(response.data)) {
      throw new Error(`Invalid response from WooCommerce: ${typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data)}`);
    }
    
    // Debug log to see what WooCommerce returns
    if (response.data.length > 0) {
      console.log('Sample WooCommerce product data:', JSON.stringify({
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price,
        regular_price: response.data[0].regular_price,
        sale_price: response.data[0].sale_price
      }, null, 2));
    }
    
    // Transform WooCommerce products to our format
    const products = response.data.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku || `WC-${product.id}`,
      price: product.regular_price || product.price || '0', // Prefer regular_price over price
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      on_sale: product.on_sale,
      status: product.status === 'publish' ? 'Active' : product.status,
      stock_status: product.stock_status || 'instock', // Ensure stock_status is always set
      stock_quantity: product.stock_quantity,
      manage_stock: product.manage_stock,
      categories: product.categories.map(cat => cat.name).join(', '),
      images: product.images.map(img => img.src),
      image: product.images[0]?.src || '',
      description: product.description,
      short_description: product.short_description,
      type: product.type,
      vendor: product.store?.name || 'WooCommerce',
      inventory: product.stock_status === 'instock' 
        ? (product.stock_quantity ? `${product.stock_quantity} in stock` : 'In stock') 
        : 'Out of stock',
      raw: product, // Keep original data
    }));

    res.json({
      success: true,
      total: parseInt(response.headers['x-wp-total'] || products.length),
      total_pages: parseInt(response.headers['x-wp-totalpages'] || 1),
      page: parseInt(page),
      per_page: parseInt(per_page),
      products,
    });
  } catch (error) {
    console.error('WooCommerce API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Fetch single product by ID
 * GET /api/woocommerce/products/:id
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const response = await makeRequest('get', `products/${id}`);
    
    const product = response.data;
    
    // If it's a variable product, fetch all variation details
    let variationsData = [];
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      try {
        console.log(`Fetching ${product.variations.length} variations for product ${id}...`);
        const variationsResponse = await makeRequest('get', `products/${id}/variations`, { per_page: 100 });
        variationsData = variationsResponse.data || [];
        console.log(`Loaded ${variationsData.length} variations with full data`);
      } catch (error) {
        console.warn(`Failed to fetch variations for product ${id}:`, error.message);
        variationsData = product.variations; // Fallback to just IDs
      }
    }
    
    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        permalink: product.permalink,
        type: product.type,
        status: product.status,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        price_html: product.price_html,
        tax_status: product.tax_status,
        tax_class: product.tax_class,
        manage_stock: product.manage_stock,
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status,
        backorders: product.backorders,
        sold_individually: product.sold_individually,
        weight: product.weight,
        dimensions: product.dimensions,
        shipping_class: product.shipping_class,
        categories: product.categories,
        tags: product.tags,
        images: product.images,
        attributes: product.attributes,
        variations: variationsData,
        featured: product.featured,
        virtual: product.virtual,
        downloadable: product.downloadable,
        downloads: product.downloads,
        related_ids: product.related_ids,
        upsell_ids: product.upsell_ids,
        cross_sell_ids: product.cross_sell_ids,
        parent_id: product.parent_id,
        meta_data: product.meta_data,
        date_created: product.date_created,
        date_modified: product.date_modified,
        raw: product,
      },
    });
  } catch (error) {
    console.error('WooCommerce API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Fetch all orders from WooCommerce
 * GET /api/woocommerce/orders
 */
async function getAllOrders(req, res) {
  try {
    const { page = 1, per_page = 50, useCache = 'true' } = req.query;
    const p = parseInt(page);
    const pp = parseInt(per_page);
    const key = `orders:page:${p}:per_page:${pp}`;

    // Try cache first
    if (useCache !== 'false') {
      const cached = ordersCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return res.json({
          success: true,
          cached: true,
          total: cached.payload.total,
          total_pages: cached.payload.total_pages,
          orders: cached.payload.data,
        });
      } else if (cached) {
        // expired
        ordersCache.delete(key);
      }
    }

    const response = await makeRequest('get', "orders", { page: p, per_page: pp });

    const payload = {
      data: response.data,
      total: parseInt(response.headers['x-wp-total'] || response.data.length),
      total_pages: parseInt(response.headers['x-wp-totalpages'] || 1),
    };

    // Cache the page
    ordersCache.set(key, { payload, expiresAt: Date.now() + ORDERS_CACHE_TTL });

    res.json({
      success: true,
      cached: false,
      total: payload.total,
      total_pages: payload.total_pages,
      orders: payload.data,
    });
  } catch (error) {
    console.error('WooCommerce API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

// HTTP handler to warm cache for orders pages
async function warmOrderCacheHandler(req, res) {
  try {
    const pages = parseInt(req.query.pages || '3');
    const per_page = parseInt(req.query.per_page || '50');
    const results = await warmOrderCache(pages, per_page);
    res.json({ success: true, warmed: results });
  } catch (err) {
    console.error('[CacheWarm] Error warming cache:', err.message || err);
    res.status(500).json({ success: false, error: err.message || err });
  }
}

/**
 * Fetch a single order by ID from WooCommerce
 * GET /api/woocommerce/orders/:id
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const response = await makeRequest('get', `orders/${id}`);

    res.json({
      success: true,
      order: response.data,
    });
  } catch (error) {
    console.error('WooCommerce API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Fetch all customers from WooCommerce
 * GET /api/woocommerce/customers
 */
async function getAllCustomers(req, res) {
  try {
    const { page = 1, per_page = 50 } = req.query;
    const response = await makeRequest('get', "customers", {
      page: parseInt(page),
      per_page: parseInt(per_page),
    });

    res.json({
      success: true,
      total: parseInt(response.headers['x-wp-total'] || response.data.length),
      total_pages: parseInt(response.headers['x-wp-totalpages'] || 1),
      customers: response.data,
    });
  } catch (error) {
    console.error('WooCommerce API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Helper function to resolve category names to IDs
 */
async function resolveCategoryIds(categories) {
  if (!categories || categories.length === 0) return [];
  
  try {
    // Fetch all categories from WooCommerce
    const allCategoriesResponse = await makeRequest('get', 'products/categories', { per_page: 100 });
    const categoryMap = {};
    
    if (Array.isArray(allCategoriesResponse.data)) {
      allCategoriesResponse.data.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id;
      });
    }
    
    // Convert category names to IDs
    return categories.map(cat => {
      const catName = typeof cat === 'string' ? cat : (cat.name || '');
      const catId = categoryMap[catName.toLowerCase()];
      
      // Return category ID if found, otherwise try to use name for creation
      if (catId) {
        return { id: catId };
      } else {
        // WooCommerce can create categories by name if they don't exist
        return { name: catName };
      }
    }).filter(cat => cat.id || cat.name);
  } catch (error) {
    console.error('Error resolving categories:', error.message);
    // Fallback: return original categories
    return categories.map(cat => typeof cat === 'string' ? { name: cat } : cat);
  }
}

/**
 * Create a new product in WooCommerce
 * POST /api/woocommerce/products
 */
async function createProduct(req, res) {
  try {
    const productData = req.body;
    
    // Transform the product data to WooCommerce format
    const resolvedCategories = await resolveCategoryIds(productData.categories);
    
    const wooCommerceProduct = {
      name: productData.name || productData.title,
      type: productData.type || 'simple',
      regular_price: productData.regular_price?.toString() || '',
      sale_price: productData.sale_price?.toString() || '',
      description: productData.description || '',
      short_description: productData.short_description || productData.description?.substring(0, 150) || '',
      sku: productData.sku || '',
      status: productData.status || 'publish',
      featured: productData.featured || false,
      virtual: productData.virtual || false,
      downloadable: productData.downloadable || false,
      tax_status: productData.tax_status || 'taxable',
      tax_class: productData.tax_class || '',
      manage_stock: productData.manage_stock || false,
      stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : null,
      stock_status: productData.stock_status || 'instock',
      backorders: productData.backorders || 'no',
      sold_individually: productData.sold_individually || false,
      weight: productData.weight?.toString() || '',
      dimensions: {
        length: productData.dimensions?.length?.toString() || '',
        width: productData.dimensions?.width?.toString() || '',
        height: productData.dimensions?.height?.toString() || ''
      },
      shipping_class: productData.shipping_class || '',
      categories: resolvedCategories,
      tags: productData.tags ? 
        productData.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag) : [],
      images: productData.images ? 
        productData.images.map(img => typeof img === 'string' ? { src: img } : img) : [],
      attributes: productData.attributes || [],
      meta_data: productData.meta_data || []
    };

    // Remove empty values to avoid API errors
    Object.keys(wooCommerceProduct).forEach(key => {
      if (wooCommerceProduct[key] === '' || wooCommerceProduct[key] === null) {
        delete wooCommerceProduct[key];
      }
    });
    
    // Also remove empty objects
    if (wooCommerceProduct.dimensions && Object.values(wooCommerceProduct.dimensions).every(v => v === '')) {
      delete wooCommerceProduct.dimensions;
    }

    console.log('Creating product in WooCommerce:', JSON.stringify(wooCommerceProduct, null, 2));

    const response = await makeRequest('post', "products", wooCommerceProduct);
    
    console.log('WooCommerce API Response Status:', response.status);
    console.log('WooCommerce API Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('WooCommerce product created - Full Response:', JSON.stringify(response.data, null, 2));
    
    res.json({
      success: true,
      message: 'Product created successfully in WooCommerce',
      product: response.data,
      woocommerce_id: response.data.id
    });

  } catch (error) {
    console.error('WooCommerce Create Product Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create product in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Update an existing product in WooCommerce
 * PUT /api/woocommerce/products/:id
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Transform the product data to WooCommerce format (same as create)
    const resolvedCategories = await resolveCategoryIds(productData.categories);
    
    const wooCommerceProduct = {
      name: productData.name || productData.title,
      type: productData.type || 'simple',
      regular_price: productData.regular_price?.toString() || '',
      sale_price: productData.sale_price?.toString() || '',
      description: productData.description || '',
      short_description: productData.short_description || '',
      sku: productData.sku || '',
      status: productData.status || 'publish',
      featured: productData.featured || false,
      virtual: productData.virtual || false,
      downloadable: productData.downloadable || false,
      tax_status: productData.tax_status || 'taxable',
      tax_class: productData.tax_class || '',
      manage_stock: productData.manage_stock || false,
      stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : null,
      stock_status: productData.stock_status || 'instock',
      backorders: productData.backorders || 'no',
      sold_individually: productData.sold_individually || false,
      weight: productData.weight?.toString() || '',
      dimensions: {
        length: productData.dimensions?.length?.toString() || '',
        width: productData.dimensions?.width?.toString() || '',
        height: productData.dimensions?.height?.toString() || ''
      },
      shipping_class: productData.shipping_class || '',
      categories: resolvedCategories,
      tags: productData.tags ? 
        productData.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag) : [],
      images: productData.images ? 
        productData.images.map(img => typeof img === 'string' ? { src: img } : img) : [],
      attributes: productData.attributes || [],
      meta_data: productData.meta_data || []
    };

    const response = await makeRequest('put', `products/${id}`, wooCommerceProduct);
    
    res.json({
      success: true,
      message: 'Product updated successfully in WooCommerce',
      product: response.data
    });

  } catch (error) {
    console.error('WooCommerce Update Product Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update product in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Delete a product from WooCommerce
 * DELETE /api/woocommerce/products/:id
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const { force = true, sku = null } = req.query;
    
    // Get product data first to retrieve SKU if not provided
    let productSku = sku;
    if (!productSku) {
      try {
        const productResponse = await makeRequest('get', `products/${id}`);
        productSku = productResponse.data?.sku;
      } catch (error) {
        console.warn('⚠️  Could not fetch product SKU before deletion:', error.message);
        // Continue with deletion even if we can't get the SKU
      }
    }

    // Delete the product from WooCommerce
    const response = await makeRequest('delete', `products/${id}`, { force: force === 'true' });
    
    // Log image cleanup info (actual cleanup happens on frontend)
    if (productSku) {
      console.log(`📋 Note: Product SKU "${productSku}" has been deleted. Associated images with SKU pattern "product-${productSku}-*" can be cleaned from GitHub.`);
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully from WooCommerce',
      product: response.data,
      sku: productSku,
      imagesNotice: productSku ? `Images for SKU "${productSku}" should be deleted separately from GitHub to prevent storage bloat.` : null
    });

  } catch (error) {
    console.error('WooCommerce Delete Product Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Fetch all categories from WooCommerce
 * GET /api/woocommerce/categories
 */
async function getAllCategories(req, res) {
  try {
    const { page = 1, per_page = 100, search = '', parent = '' } = req.query;
    
    const params = {
      page: parseInt(page),
      per_page: parseInt(per_page),
      hide_empty: false, // Include categories without products
    };
    
    if (search) {
      params.search = search;
    }
    
    if (parent !== '') {
      params.parent = parseInt(parent);
    }

    const response = await makeRequest('get', "products/categories", params);
    
    // Validate response is array (not HTML error page)
    if (!Array.isArray(response.data)) {
      throw new Error(`Invalid response from WooCommerce: ${typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data)}`);
    }
    
    // Transform WooCommerce categories to our format
    const categories = response.data.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      count: category.count || 0,
      parent: category.parent || 0,
      image: category.image?.src || null,
      display: category.display || 'default',
      menu_order: category.menu_order || 0,
      raw: category, // Keep original data
    }));

    res.json({
      success: true,
      total: parseInt(response.headers['x-wp-total'] || categories.length),
      total_pages: parseInt(response.headers['x-wp-totalpages'] || 1),
      page: parseInt(page),
      per_page: parseInt(per_page),
      categories,
    });
  } catch (error) {
    console.error('WooCommerce Categories API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Fetch single category by ID
 * GET /api/woocommerce/categories/:id
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const response = await makeRequest('get', `products/categories/${id}`);
    
    const category = response.data;
    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        count: category.count,
        parent: category.parent,
        image: category.image?.src,
        display: category.display,
        menu_order: category.menu_order,
        raw: category,
      },
    });
  } catch (error) {
    console.error('WooCommerce Category API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Create a new category in WooCommerce
 * POST /api/woocommerce/categories
 */
async function createCategory(req, res) {
  try {
    const categoryData = req.body;
    
    // Transform the category data to WooCommerce format
    const wooCommerceCategory = {
      name: categoryData.name,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      description: categoryData.description || '',
      parent: categoryData.parent ? parseInt(categoryData.parent) : 0,
      display: categoryData.display || 'default',
      menu_order: categoryData.menu_order ? parseInt(categoryData.menu_order) : 0,
    };

    // Add image if provided
    if (categoryData.image) {
      wooCommerceCategory.image = {
        src: categoryData.image
      };
    }

    console.log('Creating category in WooCommerce:', wooCommerceCategory);

    const response = await makeRequest('post', "products/categories", wooCommerceCategory);
    
    res.json({
      success: true,
      message: 'Category created successfully in WooCommerce',
      category: response.data,
      woocommerce_id: response.data.id
    });

  } catch (error) {
    console.error('WooCommerce Create Category Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create category in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Update an existing category in WooCommerce
 * PUT /api/woocommerce/categories/:id
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    // Transform the category data to WooCommerce format
    const wooCommerceCategory = {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      parent: categoryData.parent ? parseInt(categoryData.parent) : 0,
      display: categoryData.display || 'default',
      menu_order: categoryData.menu_order ? parseInt(categoryData.menu_order) : 0,
    };

    // Add image if provided
    if (categoryData.image) {
      wooCommerceCategory.image = {
        src: categoryData.image
      };
    }

    const response = await makeRequest('put', `products/categories/${id}`, wooCommerceCategory);
    
    res.json({
      success: true,
      message: 'Category updated successfully in WooCommerce',
      category: response.data
    });

  } catch (error) {
    console.error('WooCommerce Update Category Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update category in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Delete a category from WooCommerce
 * DELETE /api/woocommerce/categories/:id
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const { force = true } = req.query;
    
    const response = await makeRequest('delete', `products/categories/${id}`, { force: force === 'true' });
    
    res.json({
      success: true,
      message: 'Category deleted successfully from WooCommerce',
      category: response.data
    });

  } catch (error) {
    console.error('WooCommerce Delete Category Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Test WooCommerce connection
 * GET /api/woocommerce/test
 */
async function testConnection(req, res) {
  try {
    console.log('[TEST] Attempting WooCommerce connection...');
    const response = await makeRequest('get', "products", { per_page: 1 });
    
    console.log('[TEST] ✓ Connection successful');
    res.json({
      success: true,
      message: 'WooCommerce connection successful',
      store: process.env.WC_STORE,
      version: response.headers['x-wc-version'] || 'unknown',
    });
  } catch (error) {
    console.error('❌ WooCommerce Connection Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data?.substring(0, 500) || 'No response data',
      url: error.config?.url || 'Unknown URL',
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to connect to WooCommerce',
      details: error.response?.status ? {
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.message
      } : error.message,
      hint: 'Check your WC_STORE, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET in .env file'
    });
  }
}

/**
 * Create a new variation for a product
 * POST /api/woocommerce/products/:productId/variations
 */
async function createVariation(req, res) {
  try {
    const { productId } = req.params;
    const variationData = req.body;
    
    // Transform the variation data to WooCommerce format
    const wooCommerceVariation = {
      attributes: variationData.attributes || [],
      regular_price: variationData.regular_price?.toString() || '',
      sale_price: variationData.sale_price?.toString() || '',
      sku: variationData.sku || '',
      manage_stock: variationData.manage_stock || false,
      stock_quantity: variationData.stock_quantity ? parseInt(variationData.stock_quantity) : null,
      weight: variationData.weight?.toString() || '',
      dimensions: {
        length: variationData.dimensions?.length?.toString() || '',
        width: variationData.dimensions?.width?.toString() || '',
        height: variationData.dimensions?.height?.toString() || ''
      },
    };

    // Remove empty values
    Object.keys(wooCommerceVariation).forEach(key => {
      if (wooCommerceVariation[key] === '' || wooCommerceVariation[key] === null) {
        delete wooCommerceVariation[key];
      }
    });
    
    if (wooCommerceVariation.dimensions && Object.values(wooCommerceVariation.dimensions).every(v => v === '')) {
      delete wooCommerceVariation.dimensions;
    }

    console.log(`Creating variation for product ${productId}:`, JSON.stringify(wooCommerceVariation, null, 2));

    const response = await makeRequest('post', `products/${productId}/variations`, wooCommerceVariation);
    
    console.log(`Variation created successfully for product ${productId}`);
    
    res.json({
      success: true,
      message: 'Variation created successfully',
      variation: response.data,
      variation_id: response.data.id
    });

  } catch (error) {
    console.error('WooCommerce Create Variation Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create variation in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Update an existing variation
 * PUT /api/woocommerce/products/:productId/variations/:variationId
 */
async function updateVariation(req, res) {
  try {
    const { productId, variationId } = req.params;
    const variationData = req.body;
    
    const wooCommerceVariation = {
      attributes: variationData.attributes || [],
      regular_price: variationData.regular_price?.toString() || '',
      sale_price: variationData.sale_price?.toString() || '',
      sku: variationData.sku || '',
      manage_stock: variationData.manage_stock || false,
      stock_quantity: variationData.stock_quantity ? parseInt(variationData.stock_quantity) : null,
      weight: variationData.weight?.toString() || '',
      dimensions: {
        length: variationData.dimensions?.length?.toString() || '',
        width: variationData.dimensions?.width?.toString() || '',
        height: variationData.dimensions?.height?.toString() || ''
      },
    };

    const response = await makeRequest('put', `products/${productId}/variations/${variationId}`, wooCommerceVariation);
    
    res.json({
      success: true,
      message: 'Variation updated successfully',
      variation: response.data
    });

  } catch (error) {
    console.error('WooCommerce Update Variation Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update variation in WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Get a single variation
 * GET /api/woocommerce/products/:productId/variations/:variationId
 */
async function getVariation(req, res) {
  try {
    const { productId, variationId } = req.params;
    
    const response = await makeRequest('get', `products/${productId}/variations/${variationId}`);
    
    res.json({
      success: true,
      variation: response.data
    });

  } catch (error) {
    console.error('WooCommerce Get Variation Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variation from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

/**
 * Delete a variation
 * DELETE /api/woocommerce/products/:productId/variations/:variationId
 */
async function deleteVariation(req, res) {
  try {
    const { productId, variationId } = req.params;
    const { force = true } = req.query;
    
    const response = await makeRequest('delete', `products/${productId}/variations/${variationId}`, { force: force === 'true' });
    
    res.json({
      success: true,
      message: 'Variation deleted successfully',
      variation: response.data
    });

  } catch (error) {
    console.error('WooCommerce Delete Variation Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete variation from WooCommerce',
      details: error.response?.data || error.message,
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  getAllCustomers,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  testConnection,
  createVariation,
  updateVariation,
  getVariation,
  deleteVariation,
  warmOrderCacheHandler,
};

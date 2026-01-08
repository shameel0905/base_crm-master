const shopifyAPI = require('../shopify_api');
const crypto = require('crypto');
require('dotenv').config();

// Validate required environment variables
if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN || !process.env.SHOPIFY_API_VERSION) {
  console.error('ERROR: Missing required Shopify environment variables!');
  console.error('Required: SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN, SHOPIFY_API_VERSION');
  process.exit(1);
}

console.log(`[Shopify Controller] Initialized with store: ${process.env.SHOPIFY_STORE}`);

// Simple in-memory cache for orders
const ordersCache = new Map();
const ORDERS_CACHE_TTL = parseInt(process.env.ORDERS_CACHE_TTL_MS || '60000', 10); // 60s default

/**
 * Test Shopify connection
 * GET /api/shopify/test
 */
async function testConnection(req, res) {
  try {
    console.log('[Shopify] Testing connection...');
    
    // Try to fetch a single product to verify connection
    const products = await shopifyAPI.getProducts({ limit: 1 });
    
    res.json({
      success: true,
      message: 'Successfully connected to Shopify',
      store: process.env.SHOPIFY_STORE,
      productsAvailable: true,
    });
  } catch (error) {
    console.error('[Shopify] Connection test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      store: process.env.SHOPIFY_STORE,
    });
  }
}

// SSE clients list for broadcasting webhook events
const sseClients = new Set();

function eventsStream(req, res) {
  // Headers for SSE
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  res.write('\n');
  const clientId = Date.now() + Math.random();
  const client = { id: clientId, res };
  sseClients.add(client);

  console.log(`[Shopify] SSE client connected: ${clientId} (total: ${sseClients.size})`);

  req.on('close', () => {
    sseClients.delete(client);
    console.log(`[Shopify] SSE client disconnected: ${clientId} (remaining: ${sseClients.size})`);
  });
}

function broadcastEvent(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch (e) {
      // remove faulty client
      sseClients.delete(client);
    }
  }
}

/**
 * Get all products from Shopify
 * GET /api/shopify/products
 */
async function getAllProducts(req, res) {
  try {
    const { page, limit = 50, search } = req.query;
    
    const params = {
      limit: parseInt(limit),
    };
    
    if (page) params.fields = 'id,title,handle,vendor,product_type,status,published_at,variants,images';
    if (search) params.title = search;

    console.log('[Shopify] Fetching products with params:', params);
    const products = await shopifyAPI.getProducts(params);
    
    if (!Array.isArray(products)) {
      throw new Error('Invalid response from Shopify API');
    }

    // Transform Shopify products to our standard format
    const transformedProducts = products.map(product => {
      // Normalize variant availability: sometimes Shopify's `available` may be missing
      const firstVar = (product.variants && product.variants[0]) || {};
      const qty = Number(firstVar.inventory_quantity) || 0;
      const availableFlag = (typeof firstVar.available === 'boolean') ? firstVar.available : (qty > 0);

      // Get categories from either product_type or tags (tags are set from our categories)
      let categories = product.product_type || '';
      if (product.tags && typeof product.tags === 'string' && product.tags.trim()) {
        categories = product.tags; // Use tags as categories if they exist
      }

      return ({
      id: product.id,
      name: product.title,
      slug: product.handle,
      sku: product.variants?.[0]?.sku || `SHOP-${product.id}`,
      price: product.variants?.[0]?.price || '0',
      status: product.status === 'active' ? 'Active' : product.status,
      // If variant.available is missing/unreliable, fall back to inventory_quantity > 0
      stock_status: availableFlag ? 'instock' : 'outofstock',
      stock_quantity: qty,
      categories: categories,
      images: product.images?.map(img => img.src) || [],
      image: product.images?.[0]?.src || '',
      description: product.body_html || '',
      type: product.product_type || '',
      vendor: product.vendor || 'Shopify',
      inventory: availableFlag ? 'In Stock' : 'Out of Stock',
      variants: product.variants || [],
      tags: product.tags || '',
    });
    });

    res.json({
      success: true,
      data: transformedProducts,
      count: transformedProducts.length,
    });
  } catch (error) {
    console.error('[Shopify] Error fetching products:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get single product by ID
 * GET /api/shopify/products/:id
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    console.log(`[Shopify] Fetching product ${id}`);
    
    const product = await shopifyAPI.getProduct(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Transform product
    // Transform product
    const firstVar = (product.variants && product.variants[0]) || {};
    const qty = Number(firstVar.inventory_quantity) || 0;
    const availableFlag = (typeof firstVar.available === 'boolean') ? firstVar.available : (qty > 0);

    // Get categories from either product_type or tags
    let categories = product.product_type || '';
    if (product.tags && typeof product.tags === 'string' && product.tags.trim()) {
      categories = product.tags; // Use tags as categories if they exist
    }

    const transformed = {
      id: product.id,
      name: product.title,
      slug: product.handle,
      sku: product.variants?.[0]?.sku || `SHOP-${product.id}`,
      price: product.variants?.[0]?.price || '0',
      status: product.status === 'active' ? 'Active' : product.status,
      stock_status: availableFlag ? 'instock' : 'outofstock',
      stock_quantity: qty,
      categories: categories,
      images: product.images?.map(img => img.src) || [],
      image: product.images?.[0]?.src || '',
      description: product.body_html || '',
      type: product.product_type || '',
      vendor: product.vendor || 'Shopify',
      variants: product.variants || [],
      tags: product.tags || '',
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error('[Shopify] Error fetching product:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Create new product
 * POST /api/shopify/products
 */
async function createProduct(req, res) {
  try {
    const productData = req.body;
    console.log('[Shopify] Creating product:', productData.title);

    // Validate required fields
    if (!productData.title) {
      return res.status(400).json({
        success: false,
        error: 'Product title is required',
      });
    }

    // Format product for Shopify
    const shopifyProduct = {
      title: productData.title,
      body_html: productData.description || '',
      vendor: productData.vendor || 'Shopify',
      product_type: productData.type || '',
      handle: productData.slug || productData.title.toLowerCase().replace(/\s+/g, '-'),
      variants: productData.variants || [
        {
          price: productData.price || '0',
          // default Shopify SKU should start with SHOP-
          sku: productData.sku || `SHOP-${Date.now()}`,
          inventory_quantity: productData.stock_quantity || 0,
        },
      ],
    };

    // Add categories as tags in Shopify (since Shopify doesn't have categories)
    // Categories from frontend will be stored as tags for filtering/organization
    if (productData.categories && Array.isArray(productData.categories) && productData.categories.length > 0) {
      shopifyProduct.tags = productData.categories.join(', ');
    }

    // Handle product options (required for multi-variant products)
    // Options define the structure of variants (e.g., Size, Color, Material)
    if (productData.options && Array.isArray(productData.options) && productData.options.length > 0) {
      shopifyProduct.options = productData.options.map((opt, idx) => ({
        name: opt.name,
        position: opt.position || idx + 1,
        values: Array.isArray(opt.values) ? opt.values : [opt.values],
      }));
    }

    // Ensure each variant has an explicit SKU (Shopify may return null if SKU missing)
    if (Array.isArray(shopifyProduct.variants)) {
      shopifyProduct.variants = shopifyProduct.variants.map((v, idx) => ({
        ...v,
        sku: v.sku || `SHOP-${Date.now()}-${idx}`,
      }));
    }

    if (productData.images && Array.isArray(productData.images)) {
      // productData.images may be array of strings or objects coming from the frontend.
      // Normalize to [{ src: 'https://...' }, ...] so Shopify receives the correct shape.
      shopifyProduct.images = productData.images
        .map((img) => {
          if (!img) return null;
          if (typeof img === 'string') return { src: img };
          // may be { src: '...', url: '...', githubUrl: '...' }
          const src = img.src || img.url || img.githubUrl || null;
          return src ? { src } : null;
        })
        .filter(Boolean);
    }

    const created = await shopifyAPI.createProduct(shopifyProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created,
    });
  } catch (error) {
    console.error('[Shopify] Error creating product:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Shopify webhook receiver
 * POST /api/shopify/webhook
 */
async function webhookHandler(req, res) {
  try {
    // Raw body might be available on req.body (if raw middleware used) or as string
    const rawBody = (typeof req.body === 'string') ? req.body : JSON.stringify(req.body || {});
    const hmacHeader = req.get('x-shopify-hmac-sha256') || req.get('X-Shopify-Hmac-Sha256');
    const topic = req.get('x-shopify-topic') || req.get('X-Shopify-Topic') || 'unknown';

    if (process.env.SHOPIFY_API_SECRET && hmacHeader) {
      const expected = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET).update(rawBody, 'utf8').digest('base64');
      if (!crypto.timingSafeEqual(Buffer.from(expected, 'base64'), Buffer.from(hmacHeader, 'base64'))) {
        console.warn('[Shopify] Webhook HMAC verification failed');
        return res.status(401).send('HMAC verification failed');
      }
    }

    // Parse payload
    let payload = {};
    try { payload = JSON.parse(rawBody); } catch (e) { payload = req.body || {}; }

    console.log(`[Shopify] Received webhook topic=${topic}`);

    // Broadcast to SSE clients so connected front-ends can react
    broadcastEvent({ topic, payload, receivedAt: new Date().toISOString() });

    // For product-related events, log and respond
    if (topic && topic.includes('products')) {
      const productId = payload?.id || payload?.product_id || payload?.variant?.product_id;
      console.log(`[Shopify] Webhook for product id=${productId}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Shopify] Error handling webhook:', error.message);
    res.status(500).send('Webhook processing error');
  }
}

/**
 * Simulate a Shopify webhook event (development/testing helper)
 * POST /api/shopify/simulate
 * Body: { topic: string, payload: object }
 */
async function simulateWebhook(req, res) {
  try {
    // Only allow simulation in non-production or when DEV_SIM_KEY matches
    const allowInProduction = process.env.ALLOW_WEBHOOK_SIM === 'true';
    if (process.env.NODE_ENV === 'production' && !allowInProduction) {
      return res.status(403).json({ success: false, error: 'Webhook simulation not allowed in production' });
    }

    const { topic = 'products/update', payload = {} } = req.body || {};

    const event = {
      topic,
      payload,
      simulated: true,
      receivedAt: new Date().toISOString(),
    };

    console.log('[Shopify] Simulating webhook event:', event.topic, event.payload?.id || 'no-id');

    // Broadcast over SSE to connected clients
    broadcastEvent(event);

    return res.json({ success: true, message: 'Simulated webhook broadcasted', data: event });
  } catch (error) {
    console.error('[Shopify] Error simulating webhook:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update product
 * PUT /api/shopify/products/:id
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const productData = req.body;
    console.log(`[Shopify] Updating product ${id}`);

    // Format product for Shopify
    const shopifyProduct = {
      title: productData.title,
      body_html: productData.description || '',
      vendor: productData.vendor || '',
      product_type: productData.type || '',
    };

    if (productData.images && Array.isArray(productData.images)) {
      // Normalize incoming image items (could be strings or objects) to { src: string }
      shopifyProduct.images = productData.images
        .map((img) => {
          if (!img) return null;
          if (typeof img === 'string') return { src: img };
          const src = img.src || img.url || img.githubUrl || null;
          return src ? { src } : null;
        })
        .filter(Boolean);
    }

    // If variants provided for update, ensure every variant has a SKU
    if (Array.isArray(shopifyProduct.variants)) {
      shopifyProduct.variants = shopifyProduct.variants.map((v, idx) => ({
        ...v,
        sku: v.sku || `SHOP-${Date.now()}-${idx}`,
      }));
    }

    const updated = await shopifyAPI.updateProduct(id, shopifyProduct);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[Shopify] Error updating product:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Delete product
 * DELETE /api/shopify/products/:id
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    console.log(`[Shopify] Deleting product ${id}`);

    await shopifyAPI.deleteProduct(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('[Shopify] Error deleting product:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get all orders from Shopify
 * GET /api/shopify/orders
 */
async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const cacheKey = `orders:page:${page}:per_page:${limit}`;

    // Check cache
    if (ordersCache.has(cacheKey)) {
      const cached = ordersCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        console.log('[Shopify] Returning cached orders');
        return res.json(cached.data);
      }
      ordersCache.delete(cacheKey);
    }

    console.log('[Shopify] Fetching orders from API...');
    const orders = await shopifyAPI.getOrders({ 
      limit: parseInt(limit),
      fields: 'id,order_number,created_at,email,total_price,currency,financial_status,fulfillment_status,customer,line_items',
    });

    // Transform orders
    const transformed = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_email: order.email,
      customer_name: order.customer?.first_name + ' ' + order.customer?.last_name,
      total_price: order.total_price,
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status || 'pending',
      created_at: order.created_at,
      line_items: order.line_items || [],
      item_count: order.line_items?.length || 0,
    }));

    const payload = {
      success: true,
      data: transformed,
      count: transformed.length,
      page: parseInt(page),
    };

    // Cache the result
    ordersCache.set(cacheKey, { 
      data: payload, 
      expiresAt: Date.now() + ORDERS_CACHE_TTL 
    });

    res.json(payload);
  } catch (error) {
    console.error('[Shopify] Error fetching orders:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get single order by ID
 * GET /api/shopify/orders/:id
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    console.log(`[Shopify] Fetching order ${id}`);

    const order = await shopifyAPI.getOrder(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const transformed = {
      id: order.id,
      order_number: order.order_number,
      customer_email: order.email,
      customer_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
      total_price: order.total_price,
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status || 'pending',
      created_at: order.created_at,
      updated_at: order.updated_at,
      line_items: order.line_items || [],
      billing_address: order.billing_address,
      shipping_address: order.shipping_address,
    };

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error('[Shopify] Error fetching order:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get all customers
 * GET /api/shopify/customers
 */
async function getAllCustomers(req, res) {
  try {
    const { limit = 50 } = req.query;
    console.log('[Shopify] Fetching customers...');

    const customers = await shopifyAPI.getCustomers({ 
      limit: parseInt(limit),
    });

    const transformed = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      orders_count: customer.orders_count,
      total_spent: customer.total_spent,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));

    res.json({
      success: true,
      data: transformed,
      count: transformed.length,
    });
  } catch (error) {
    console.error('[Shopify] Error fetching customers:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get variants for a product
 * GET /api/shopify/products/:productId/variants
 */
async function getVariants(req, res) {
  try {
    const { productId } = req.params;
    console.log(`[Shopify] Fetching variants for product ${productId}`);

    const variants = await shopifyAPI.getVariants(productId);

    res.json({
      success: true,
      data: variants,
      count: variants.length,
    });
  } catch (error) {
    console.error('[Shopify] Error fetching variants:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get collections (Shopify categories)
 * GET /api/shopify/collections
 */
async function getCollections(req, res) {
  try {
    const params = req.query || {};
    console.log('[Shopify] Fetching collections with params:', params);
    let collections = [];
    try {
      collections = await shopifyAPI.getCollections(params);
    } catch (err) {
      // If shopify client returned 404 (collections not available) treat as empty list rather than failing
      if (err && err.statusCode === 404) {
        console.warn('[Shopify] Collections endpoint returned 404; returning empty list instead of error');
        collections = [];
      } else {
        throw err;
      }
    }

    // Normalize to simple { id, title, handle } format
    const transformed = (collections || []).map(c => ({ id: c.id, title: c.title || c.handle || '', handle: c.handle || '' }));

    res.json({ success: true, data: transformed, count: transformed.length });
  } catch (error) {
    console.error('[Shopify] Error fetching collections:', error.message);
    // If API returned 404 upstream we'll map that to empty data above, otherwise propagate error
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get single collection by id
 * GET /api/shopify/collections/:id
 */
async function getCollectionById(req, res) {
  try {
    const { id } = req.params;
    console.log(`[Shopify] Fetching collection ${id}`);
    const collection = await shopifyAPI.getCollection(id);
    if (!collection) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('[Shopify] Error fetching collection by id:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create a Shopify collection (custom collection)
 * POST /api/shopify/collections
 */
async function createCollection(req, res) {
  try {
    const collectionData = req.body;
    console.log('[Shopify] Creating collection:', collectionData);

    if (!collectionData || !collectionData.title) {
      return res.status(400).json({ success: false, error: 'Collection title is required' });
    }

    const created = await shopifyAPI.createCollection({ 
      title: collectionData.title, 
      handle: collectionData.handle || undefined, 
      body_html: collectionData.body_html || undefined,
      parent: collectionData.parent || 0
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('[Shopify] Error creating collection:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update a Shopify collection
 * PUT /api/shopify/collections/:id
 */
async function updateCollection(req, res) {
  try {
    const { id } = req.params;
    const collectionData = req.body;
    console.log(`[Shopify] Updating collection ${id}:`, collectionData);

    if (!collectionData || !collectionData.title) {
      return res.status(400).json({ success: false, error: 'Collection title is required' });
    }

    const updated = await shopifyAPI.updateCollection(id, { 
      title: collectionData.title, 
      handle: collectionData.handle || undefined, 
      body_html: collectionData.body_html || undefined,
      parent: collectionData.parent || 0
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Shopify] Error updating collection:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete a Shopify collection
 * DELETE /api/shopify/collections/:id
 */
async function deleteCollection(req, res) {
  try {
    const { id } = req.params;
    console.log(`[Shopify] Deleting collection ${id}`);

    await shopifyAPI.deleteCollection(id);

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    console.error('[Shopify] Error deleting collection:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get collects
 * GET /api/shopify/collects
 */
async function getCollects(req, res) {
  try {
    const params = req.query || {};
    console.log('[Shopify] Fetching collects with params:', params);
    const collects = await shopifyAPI.getCollects(params);
    res.json({ success: true, data: collects, count: collects.length });
  } catch (error) {
    console.error('[Shopify] Error fetching collects:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create a collect (link product to collection)
 * POST /api/shopify/collects
 */
async function createCollect(req, res) {
  try {
    const collectData = req.body;
    if (!collectData || !collectData.product_id || !collectData.collection_id) {
      return res.status(400).json({ success: false, error: 'product_id and collection_id are required' });
    }

    const created = await shopifyAPI.createCollect(collectData);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('[Shopify] Error creating collect:', error.message, error.data || '');
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete collect
 * DELETE /api/shopify/collects/:id
 */
async function deleteCollect(req, res) {
  try {
    const { id } = req.params;
    await shopifyAPI.deleteCollect(id);
    res.json({ success: true, message: 'Collect deleted' });
  } catch (error) {
    console.error('[Shopify] Error deleting collect:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create variant
 * POST /api/shopify/products/:productId/variants
 */
async function createVariant(req, res) {
  try {
    const { productId } = req.params;
    const variantData = req.body;
    console.log(`[Shopify] Creating variant for product ${productId}`);

    // Ensure SKU follows Shopify prefix convention if not provided
    if (!variantData.sku) {
      variantData.sku = `SHOP-${Date.now()}`;
    }
    const variant = await shopifyAPI.createVariant(productId, variantData);

    res.status(201).json({
      success: true,
      message: 'Variant created successfully',
      data: variant,
    });
  } catch (error) {
    console.error('[Shopify] Error creating variant:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update variant
 * PUT /api/shopify/products/:productId/variants/:variantId
 */
async function updateVariant(req, res) {
  try {
    const { productId, variantId } = req.params;
    const variantData = req.body;
    console.log(`[Shopify] Updating variant ${variantId} for product ${productId}`);

    const variant = await shopifyAPI.updateVariant(productId, variantId, variantData);

    res.json({
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    });
  } catch (error) {
    console.error('[Shopify] Error updating variant:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Delete variant
 * DELETE /api/shopify/products/:productId/variants/:variantId
 */
async function deleteVariant(req, res) {
  try {
    const { productId, variantId } = req.params;
    console.log(`[Shopify] Deleting variant ${variantId} for product ${productId}`);

    await shopifyAPI.deleteVariant(productId, variantId);

    res.json({
      success: true,
      message: 'Variant deleted successfully',
    });
  } catch (error) {
    console.error('[Shopify] Error deleting variant:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  testConnection,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  getAllCustomers,
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollects,
  createCollect,
  deleteCollect,
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  webhookHandler,
  simulateWebhook,
  eventsStream,
  broadcastEvent,
};

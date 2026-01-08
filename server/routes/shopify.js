const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopifyController');

/**
 * Shopify API Routes
 * Base: /api/shopify
 */

// Test connection
router.get('/test', shopifyController.testConnection);

// Products
router.get('/products', shopifyController.getAllProducts);
router.get('/products/:id', shopifyController.getProductById);
router.post('/products', shopifyController.createProduct);
router.put('/products/:id', shopifyController.updateProduct);
router.delete('/products/:id', shopifyController.deleteProduct);

// Variants
router.get('/products/:productId/variants', shopifyController.getVariants);
router.post('/products/:productId/variants', shopifyController.createVariant);
router.put('/products/:productId/variants/:variantId', shopifyController.updateVariant);
router.delete('/products/:productId/variants/:variantId', shopifyController.deleteVariant);

// Orders
router.get('/orders', shopifyController.getAllOrders);
router.get('/orders/:id', shopifyController.getOrderById);

// Collections (Shopify categories/collections)
router.get('/collections', shopifyController.getCollections);
router.get('/collections/:id', shopifyController.getCollectionById);
router.post('/collections', shopifyController.createCollection);
router.put('/collections/:id', shopifyController.updateCollection);
router.delete('/collections/:id', shopifyController.deleteCollection);

// Collects (link products to custom collections)
router.get('/collects', shopifyController.getCollects);
router.post('/collects', shopifyController.createCollect);
router.delete('/collects/:id', shopifyController.deleteCollect);

// Customers
router.get('/customers', shopifyController.getAllCustomers);

// Webhooks - raw body for HMAC verification
router.post('/webhook', express.raw({ type: 'application/json' }), shopifyController.webhookHandler);

// Server-Sent Events (SSE) stream for live webhook events
router.get('/events', shopifyController.eventsStream);

// Development helper - simulate a webhook event (broadcast via SSE)
router.post('/simulate', express.json(), shopifyController.simulateWebhook);

module.exports = router;

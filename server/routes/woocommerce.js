const express = require('express');
const router = express.Router();
const woocommerceController = require('../controllers/woocommerceController');

/**
 * WooCommerce API Routes
 * Base: /api/woocommerce
 */

// Test connection
router.get('/test', woocommerceController.testConnection);

// Products
router.get('/products', woocommerceController.getAllProducts);
router.get('/products/:id', woocommerceController.getProductById);
router.post('/products', woocommerceController.createProduct);
router.put('/products/:id', woocommerceController.updateProduct);
router.delete('/products/:id', woocommerceController.deleteProduct);

// Variations
router.post('/products/:productId/variations', woocommerceController.createVariation);
router.put('/products/:productId/variations/:variationId', woocommerceController.updateVariation);
router.get('/products/:productId/variations/:variationId', woocommerceController.getVariation);
router.delete('/products/:productId/variations/:variationId', woocommerceController.deleteVariation);

// Categories
router.get('/categories', woocommerceController.getAllCategories);
router.get('/categories/:id', woocommerceController.getCategoryById);
router.post('/categories', woocommerceController.createCategory);
router.put('/categories/:id', woocommerceController.updateCategory);
router.delete('/categories/:id', woocommerceController.deleteCategory);

// Orders
router.get('/orders', woocommerceController.getAllOrders);
router.get('/orders/cache-warm', woocommerceController.warmOrderCacheHandler);
router.get('/orders/:id', woocommerceController.getOrderById);

// Customers
router.get('/customers', woocommerceController.getAllCustomers);

module.exports = router;

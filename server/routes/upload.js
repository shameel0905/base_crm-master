const express = require('express');
const githubImageService = require('../services/githubImageService');

const router = express.Router();

/**
 * Test GitHub connection
 * GET /api/upload/github/test
 */
router.get('/github/test', async (req, res) => {
  try {
    const result = await githubImageService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test GitHub connection'
    });
  }
});

/**
 * Upload single image to GitHub
 * POST /api/upload/github
 * Body: { base64Data: string, fileName: string, productId: number (optional), sku: string (optional) }
 */
router.post('/github', async (req, res) => {
  try {
    const { base64Data, fileName, productId, sku } = req.body;

    // Validate input
    if (!base64Data || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: base64Data, fileName',
        message: 'Invalid upload request'
      });
    }

    console.log(`\n📥 Image upload request received`);
    console.log(`   File: ${fileName}`);
    console.log(`   Product ID: ${productId || 'N/A'}`);
    console.log(`   SKU: ${sku || 'N/A'}`);

    // Upload to GitHub
    const result = await githubImageService.uploadImage(base64Data, fileName, productId, sku);

    if (result.success) {
      console.log(`✅ Upload successful: ${result.url}\n`);
      res.json({
        success: true,
        url: result.url,
        path: result.path,
        fileName: result.fileName,
        message: result.message,
        gitHubResponse: result.gitHubResponse
      });
    } else {
      console.log(`❌ Upload failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to upload image to GitHub'
    });
  }
});

/**
 * Upload multiple images to GitHub
 * POST /api/upload/github/batch
 * Body: { images: [{ base64Data, fileName }, ...], productId: number (optional), sku: string (optional) }
 */
router.post('/github/batch', async (req, res) => {
  try {
    const { images, productId, sku } = req.body;

    // Validate input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid images array',
        message: 'Invalid batch upload request'
      });
    }

    console.log(`\n📥 Batch upload request received: ${images.length} images`);
    console.log(`   Product ID: ${productId || 'N/A'}`);
    console.log(`   SKU: ${sku || 'N/A'}`);

    // Upload all images
    const results = await githubImageService.uploadMultipleImages(images, productId, sku);

    const successCount = results.filter(r => r.success).length;
    const successfulImages = results
      .filter(r => r.success)
      .map(r => ({ fileName: r.fileName, url: r.url }));

    console.log(`📊 Batch upload completed: ${successCount}/${results.length} successful\n`);

    res.json({
      success: successCount === results.length,
      totalAttempted: results.length,
      successCount: successCount,
      failureCount: results.length - successCount,
      uploadedImages: successfulImages,
      failedImages: results
        .filter(r => !r.success)
        .map(r => ({ fileName: r.fileName || 'unknown', error: r.error })),
      message: `Uploaded ${successCount} of ${results.length} images successfully`,
      results: results
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to perform batch upload'
    });
  }
});

/**
 * Delete image from GitHub
 * DELETE /api/upload/github
 * Body: { filePath: string }
 */
router.delete('/github', async (req, res) => {
  try {
    const { filePath } = req.body;

    // Validate input
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: filePath',
        message: 'Invalid delete request'
      });
    }

    console.log(`🗑️  Delete request: ${filePath}`);

    // Delete from GitHub
    const result = await githubImageService.deleteImage(filePath);

    if (result.success) {
      console.log(`✅ Delete successful\n`);
      res.json({
        success: true,
        message: result.message
      });
    } else {
      console.log(`❌ Delete failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete image from GitHub'
    });
  }
});

/**
 * Delete images by SKU
 * POST /api/upload/github/delete-by-sku
 * Body: { sku: string }
 */
router.post('/github/delete-by-sku', async (req, res) => {
  try {
    const { sku } = req.body;

    // Validate input
    if (!sku) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sku',
        message: 'Invalid delete request'
      });
    }

    console.log(`🗑️  Delete request for SKU: ${sku}`);

    // Delete images by SKU from GitHub
    const result = await githubImageService.deleteImagesBySKU(sku);

    if (result.success || result.deletedCount === 0) {
      console.log(`✅ Delete by SKU completed: ${result.deletedCount} image(s) deleted\n`);
      res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: result.message,
        results: result.results
      });
    } else {
      console.log(`❌ Delete by SKU failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        deletedCount: result.deletedCount,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Delete by SKU error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      deletedCount: 0,
      message: 'Failed to delete images by SKU from GitHub'
    });
  }
});

/**
 * Delete images by category ID
 * POST /api/upload/github/delete-by-category
 * Body: { categoryId: string }
 */
router.post('/github/delete-by-category', async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Validate input
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: categoryId',
        message: 'Invalid delete request'
      });
    }

    console.log(`🗑️  Delete request for category: ${categoryId}`);

    // Delete images by category ID from GitHub
    const result = await githubImageService.deleteImagesBySKU(categoryId);

    if (result.success || result.deletedCount === 0) {
      console.log(`✅ Delete by category completed: ${result.deletedCount} image(s) deleted\n`);
      res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: result.message,
        results: result.results
      });
    } else {
      console.log(`❌ Delete by category failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        deletedCount: result.deletedCount,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Delete by category error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      deletedCount: 0,
      message: 'Failed to delete images by category from GitHub'
    });
  }
});

/**
 * List images for a product
 * GET /api/upload/github/list/:productId
 */
router.get('/github/list/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    console.log(`📂 List request for product: ${productId}`);

    const result = await githubImageService.listProductImages(productId);

    if (result.success) {
      console.log(`✅ Found ${result.images.length} images\n`);
      res.json({
        success: true,
        images: result.images,
        count: result.images.length,
        message: result.message
      });
    } else {
      console.log(`❌ List failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        images: [],
        message: result.message
      });
    }
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: [],
      message: 'Failed to list images'
    });
  }
});

/**
 * Upload category image to GitHub
 * POST /api/upload/github-category
 * Body: { fileData: string, fileName: string, filePath: string, categoryName: string, mimeType: string }
 */
router.post('/github-category', async (req, res) => {
  try {
    const { fileData, fileName, filePath, categoryName, mimeType } = req.body;

    // Validate input
    if (!fileData || !fileName || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileData, fileName, filePath',
        message: 'Invalid category upload request'
      });
    }

    console.log(`\n📥 Category image upload request received`);
    console.log(`   File: ${fileName}`);
    console.log(`   Category: ${categoryName || 'N/A'}`);
    console.log(`   Path: ${filePath}`);

    // Upload to GitHub using the same service
    const result = await githubImageService.uploadImage(fileData, fileName, null, filePath);

    if (result.success) {
      console.log(`✅ Category upload successful: ${result.url}\n`);
      res.json({
        success: true,
        url: result.url,
        path: result.path,
        fileName: result.fileName,
        categoryName: categoryName,
        message: result.message
      });
    } else {
      console.log(`❌ Category upload failed: ${result.error}\n`);
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Category upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to upload category image to GitHub'
    });
  }
});

module.exports = router;

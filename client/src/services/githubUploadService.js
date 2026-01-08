/**
 * GitHub Image Upload Service (Frontend)
 * Handles uploading images to GitHub and retrieving public URLs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class GitHubUploadService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/upload`;
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Test GitHub connection
   */
  async testConnection() {
    try {
      console.log('🧪 Testing GitHub connection...');
      const response = await fetch(`${this.baseUrl}/github/test`);
      const data = await response.json();

      if (data.success) {
        console.log(`✅ Connected to GitHub as: ${data.user}`);
        return { success: true, user: data.user };
      } else {
        console.error('❌ GitHub connection failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Connection error:', error);
      return {
        success: false,
        error: 'Failed to connect to GitHub service'
      };
    }
  }

  /**
   * Upload single image to GitHub
   * @param {File} file - Image file
   * @param {number} productId - Product ID (optional)
   * @param {string} sku - Product SKU (optional)
   * @returns {Promise<{success: boolean, url: string, fileName: string, error?: string}>}
   */
  async uploadImage(file, productId = null, sku = null) {
    try {
      console.log(`📤 Uploading image: ${file.name}${sku ? ` (SKU: ${sku})` : ''}`);

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Send to backend
      const response = await fetch(`${this.baseUrl}/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data: base64Data,
          fileName: file.name,
          productId: productId,
          sku: sku
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Upload successful!`);
        console.log(`📎 Public URL: ${data.url}`);
        return {
          success: true,
          url: data.url,
          fileName: data.fileName,
          path: data.path,
          message: data.message
        };
      } else {
        console.error('❌ Upload failed:', data.error, data.message || '');
        // Detect common auth message and add helpful guidance
        if (data.error && (data.error.toLowerCase().includes('bad credentials') || (data.message || '').toLowerCase().includes('authentication') || (data.message || '').toLowerCase().includes('permission'))) {
          data.error = `${data.error} — GitHub authentication/permission error. Ensure server-side GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO are configured and token has repo:contents scope.`;
        }
        return {
          success: false,
          error: data.error || 'Upload failed',
          url: null,
          message: data.message
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      const message = error?.message || 'Failed to upload image';
      const helpful = message.toLowerCase().includes('bad credentials') || message.toLowerCase().includes('authentication')
        ? `${message} — double-check server-side GitHub configuration (GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO)`
        : message;
      return {
        success: false,
        error: helpful,
        url: null,
        message: 'Failed to upload image'
      };
    }
  }

  /**
   * Upload multiple images to GitHub
   * @param {File[]} files - Array of image files
   * @param {number} productId - Product ID (optional)
   * @param {string} sku - Product SKU (optional)
   * @returns {Promise<{success: boolean, urls: string[], errors: string[]}>}
   */
  async uploadMultipleImages(files, productId = null, sku = null) {
    try {
      console.log(`📤 Uploading ${files.length} images...${sku ? ` (SKU: ${sku})` : ''}`);

      const uploadedUrls = [];
      const errors = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`   [${i + 1}/${files.length}] ${file.name}`);

        const result = await this.uploadImage(file, productId, sku);

        if (result.success) {
          uploadedUrls.push(result.url);
        } else {
          const err = result.error;
          // add audible hint for auth problems
          if (err && (err.toLowerCase().includes('bad credentials') || err.toLowerCase().includes('authentication') || err.toLowerCase().includes('permission'))) {
            errors.push({ fileName: file.name, error: `${err} — check server-side GitHub token and repo settings` });
          } else {
            errors.push({ fileName: file.name, error: result.error });
          }
        }

        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`\n📊 Upload Summary: ${uploadedUrls.length}/${files.length} successful`);

      return {
        success: errors.length === 0,
        urls: uploadedUrls,
        errors: errors,
        successCount: uploadedUrls.length,
        failureCount: errors.length,
        message: `Uploaded ${uploadedUrls.length} of ${files.length} images`
      };
    } catch (error) {
      console.error('Batch upload error:', error);
      return {
        success: false,
        urls: [],
        errors: [],
        error: error.message,
        message: 'Failed to upload images'
      };
    }
  }

  /**
   * Delete image from GitHub
   * @param {string} filePath - File path in GitHub
   */
  async deleteImage(filePath) {
    try {
      console.log(`🗑️  Deleting image: ${filePath}`);

      const response = await fetch(`${this.baseUrl}/github`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Image deleted successfully`);
        return { success: true, message: data.message };
      } else {
        console.error('❌ Delete failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete all images with specific SKU
   * @param {string} sku - Product SKU
   */
  async deleteImagesBySKU(sku) {
    try {
      console.log(`🗑️  Deleting images with SKU: ${sku}`);

      const response = await fetch(`${this.baseUrl}/github/delete-by-sku`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sku })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Images deleted: ${data.deletedCount}`);
        return { success: true, deletedCount: data.deletedCount, message: data.message };
      } else {
        console.error('❌ Delete by SKU failed:', data.error);
        return { success: false, error: data.error, deletedCount: 0 };
      }
    } catch (error) {
      console.error('Delete by SKU error:', error);
      return {
        success: false,
        error: error.message,
        deletedCount: 0
      };
    }
  }

  /**
   * List images for a product
   * @param {number} productId - Product ID
   */
  async listProductImages(productId) {
    try {
      console.log(`📂 Listing images for product: ${productId}`);

      const response = await fetch(`${this.baseUrl}/github/list/${productId}`);
      const data = await response.json();

      if (data.success) {
        console.log(`✅ Found ${data.count} images`);
        return {
          success: true,
          images: data.images,
          count: data.count
        };
      } else {
        console.error('❌ List failed:', data.error);
        return {
          success: false,
          error: data.error,
          images: [],
          count: 0
        };
      }
    } catch (error) {
      console.error('List error:', error);
      return {
        success: false,
        error: error.message,
        images: [],
        count: 0
      };
    }
  }
}

export default new GitHubUploadService();

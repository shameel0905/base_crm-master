const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class WooCommerceService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/woocommerce`;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('Making request to:', url);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        
        // Try to get error details
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      
      // Check if it's a network error
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Make sure the backend server is running on ' + this.baseUrl);
      }
      
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    return this.makeRequest('/test');
  }

  // Product methods
  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/products${queryString ? '?' + queryString : ''}`);
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    // Convert base64 images to data URLs that can be processed
    // If images have base64, they'll be handled by WooCommerce API
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Upload image to WooCommerce media library
  async uploadImage(base64Data, fileName) {
    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', blob, fileName);
      
      const uploadResponse = await fetch(`${this.baseUrl}/upload-media`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      return await uploadResponse.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id, force = true) {
    return this.makeRequest(`/products/${id}?force=${force}`, {
      method: 'DELETE',
    });
  }

  // Variation methods
  async createVariation(productId, variationData) {
    return this.makeRequest(`/products/${productId}/variations`, {
      method: 'POST',
      body: JSON.stringify(variationData),
    });
  }

  async updateVariation(productId, variationId, variationData) {
    return this.makeRequest(`/products/${productId}/variations/${variationId}`, {
      method: 'PUT',
      body: JSON.stringify(variationData),
    });
  }

  async getVariation(productId, variationId) {
    return this.makeRequest(`/products/${productId}/variations/${variationId}`);
  }

  async deleteVariation(productId, variationId, force = true) {
    return this.makeRequest(`/products/${productId}/variations/${variationId}?force=${force}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/orders${queryString ? '?' + queryString : ''}`);
  }

  async getOrder(id) {
    return this.makeRequest(`/orders/${id}`);
  }

  // Customer methods
  async getAllCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/customers${queryString ? '?' + queryString : ''}`);
  }

  // Category methods
  async getAllCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/categories${queryString ? '?' + queryString : ''}`);
  }

  async getCategory(id) {
    return this.makeRequest(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.makeRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id, force = true) {
    return this.makeRequest(`/categories/${id}?force=${force}`, {
      method: 'DELETE',
    });
  }
}

export default new WooCommerceService();
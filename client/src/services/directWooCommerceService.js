// Direct WooCommerce connection (for testing only)
class DirectWooCommerceService {
  constructor() {
    this.baseUrl = 'https://cwc-shop.com/wp-json/wc/v3';
    this.auth = btoa('ck_aad6c0ff44d79699009ab6828c9e0fd120f8b3cf:cs_f5d8494d92bdeaa98e645bfa74835db0ff092063');
  }

  async getAllProducts(params = {}) {
    const url = new URL(`${this.baseUrl}/products`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const products = await response.json();
      
      return {
        success: true,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          regular_price: p.regular_price,
          status: p.status === 'publish' ? 'Active' : p.status,
          stock_quantity: p.stock_quantity,
          categories: p.categories.map(c => c.name).join(', '),
          image: p.images[0]?.src || '',
          images: p.images.map(img => img.src),
        })),
        total: products.length
      };
    } catch (error) {
      console.error('Direct WooCommerce API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DirectWooCommerceService();
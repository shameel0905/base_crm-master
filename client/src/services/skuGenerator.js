/**
 * SKU Generator Service
 * Generates unique, professional SKU codes for products
 * Format: [Category][Hash] - Short but very unique
 * Example: PRD-A7F2K9X1
 */

class SKUGenerator {
  /**
   * Generate a unique SKU (Short format: CAT-XXXX)
   * @param {string} category - Product category (default: 'PRD')
   * @returns {string} Generated SKU
   */
  static generateSKU(category = 'PRD') {
    // Sanitize category to 2 uppercase letters (shorter)
    const cleanCategory = (category || 'PRD')
      .toString()
      .substring(0, 2)
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .padEnd(2, 'X');

    // Generate timestamp-based hash (5 characters for more uniqueness)
    const date = new Date();
    const timestamp = date.getTime().toString();
    const hashComponent = this.generateHashFromTimestamp(timestamp);

    // Generate random component (3 alphanumeric characters)
    const randomComponent = this.generateRandomCode(3);

    // Combine into short professional SKU: CAT-HASHXX
    return `${cleanCategory}-${hashComponent}${randomComponent}`;
  }

  /**
   * Generate hash from timestamp for uniqueness
   * @param {string} timestamp - Timestamp string
   * @returns {string} Hash component
   */
  static generateHashFromTimestamp(timestamp) {
    // Create a hash from timestamp using modulo operations
    const hash = parseInt(timestamp.slice(-6), 10) % 999999;
    const hexHash = Math.abs(hash).toString(16).toUpperCase();
    return hexHash.padStart(2, '0');
  }

  /**
   * Generate a random alphanumeric code
   * @param {number} length - Length of the code
   * @returns {string} Random code
   */
  static generateRandomCode(length = 3) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate SKU for specific product category
   * @param {string} productName - Product name
   * @param {string} categoryName - Category name
   * @returns {string} Generated SKU
   */
  static generateSKUForProduct(productName, categoryName = 'PRD') {
    // Extract first 2 characters from category name as prefix (shorter)
    const categoryPrefix = (categoryName || 'PRD')
      .substring(0, 2)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X')
      .padEnd(2, 'X');

    return this.generateSKU(categoryPrefix);
  }

  /**
   * Generate bulk SKUs
   * @param {number} count - Number of SKUs to generate
   * @param {string} category - Category prefix
   * @returns {array} Array of generated SKUs
   */
  static generateBulkSKUs(count = 5, category = 'PRD') {
    const skus = [];
    for (let i = 0; i < count; i++) {
      skus.push(this.generateSKU(category));
    }
    return skus;
  }

  /**
   * Format and display SKU
   * @param {string} sku - SKU to format
   * @returns {string} Formatted SKU
   */
  static formatSKU(sku) {
    if (!sku) return '';
    return sku.toUpperCase().trim();
  }

  /**
   * Validate SKU format
   * @param {string} sku - SKU to validate
   * @returns {boolean} True if valid
   */
  static isValidSKU(sku) {
    // Format: XX-XXXXXXX (Short format, 9 characters with dash)
    const skuPattern = /^[A-Z]{2}-[A-Z0-9]{5}$/;
    return skuPattern.test(sku);
  }
}

export default SKUGenerator;

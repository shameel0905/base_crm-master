import { useState, useEffect } from 'react';
import wooCommerceService from '../services/woocommerceService';

export function TestWooCommercePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  const testConnection = async () => {
    try {
      const response = await wooCommerceService.testConnection();
      setConnectionStatus(response.success ? 'connected' : 'disconnected');
      console.log('Connection test result:', response);
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Connection test failed:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products...');
      const response = await wooCommerceService.getAllProducts({ per_page: 10 });
      console.log('API Response:', response);
      
      if (response.success) {
        setProducts(response.products || []);
        console.log('Products set:', response.products);
      } else {
        setError(response.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WooCommerce API Test</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span>{connectionStatus}</span>
          <button 
            onClick={testConnection}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Test Again
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6 p-4 border rounded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Products ({products.length})</h2>
          <button 
            onClick={fetchProducts}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Fetch Products'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">Loading products...</div>
        )}

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">SKU</th>
                  <th className="border p-2 text-left">Price</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border p-2">{product.id}</td>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{product.sku || '-'}</td>
                    <td className="border p-2">${product.price || '0.00'}</td>
                    <td className="border p-2">{product.status}</td>
                    <td className="border p-2">{product.stock_quantity || product.inventory || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && (
          <div className="text-center py-4 text-gray-500">
            No products fetched yet. Click "Fetch Products" to load data.
          </div>
        )}
      </div>

      {/* Raw API Response */}
      {products.length > 0 && (
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Sample Product Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default TestWooCommercePage;
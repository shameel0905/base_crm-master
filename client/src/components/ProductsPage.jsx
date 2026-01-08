import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Package, Search, Download, Plus, Trash2, Pencil, RefreshCw, X } from "lucide-react";
import wooCommerceService from "../services/woocommerceService";
import shopifyService from "../services/shopifyService";

// Simple export function
function exportToCSV(products, source) {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }
  const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Categories'];
  const rows = [headers.join(',')];
  
  for (const p of products) {
    const row = [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.sku || '',
      p.price || '',
      p.stock_quantity || '',
      p.status || '',
      `"${(p.categories || '').replace(/"/g, '""')}"`
    ];
    rows.push(row.join(','));
  }
  
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${source}_products_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export function ProductsPage() {
  const location = useLocation();

  // Read default platform from URL query param or localStorage so selection persists
  const getInitialPlatform = () => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('platform');
      if (q === 'shopify' || q === 'woocommerce') return q;
    } catch (e) { /* ignore */ }
    const stored = localStorage.getItem('products.activeSource');
    return stored === 'shopify' ? 'shopify' : 'woocommerce';
  };

  const [activeSource, setActiveSource] = useState(getInitialPlatform()); // 'woocommerce' or 'shopify'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('all'); // all, active, draft, archived
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const pageSize = 10; // Pagination limit per page
  const navigate = useNavigate();

  // Fetch products from backend
  const fetchProducts = async () => {
    console.log('fetchProducts called with:', { activeSource, currentPage, activeTab });
    setLoading(true);
    try {
      if (activeSource === "woocommerce") {
        // Use WooCommerce service
        const params = {
          page: currentPage,
          per_page: pageSize
        };
        
        if (searchTerm) params.search = searchTerm;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;

        const data = await wooCommerceService.getAllProducts(params);
        
        if (data.success) {
          let fetched = data.products || [];

          // If activeTab is filtering locally (in case backend doesn't provide it)
          if (activeTab === 'active') {
            fetched = fetched.filter(p => p.status === 'publish' || p.status === 'Active');
          } else if (activeTab === 'draft') {
            fetched = fetched.filter(p => p.status === 'draft' || p.status === 'Draft');
          } else if (activeTab === 'archived') {
            fetched = fetched.filter(p => p.status === 'archived' || p.status === 'trash');
          }

          setProducts(fetched);
          setTotalProducts(data.total || fetched.length || 0);
        } else {
          console.error("Failed to fetch products:", data.error || 'Unknown error');
          setProducts([]);
          setTotalProducts(0);
        }
      } else {
        // For Shopify, fetch ALL products and sort/paginate on frontend (latest first)
        const params = {
          limit: 250, // Get all products from backend
        };
        
        if (searchTerm) params.search = searchTerm;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;

        const data = await shopifyService.getAllProducts(params);
        
        if (data.success) {
          let fetched = data.data || [];

          // Apply local filtering if needed
          if (activeTab === 'active') {
            fetched = fetched.filter(p => p.status === 'Active');
          } else if (activeTab === 'draft') {
            fetched = fetched.filter(p => p.status === 'Draft');
          } else if (activeTab === 'archived') {
            fetched = fetched.filter(p => p.status === 'Archived');
          }

          // Sort by latest (most recent first) - sort by ID descending for newest first
          fetched = fetched.sort((a, b) => b.id - a.id);

          // Apply pagination on frontend (latest first)
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedProducts = fetched.slice(startIndex, endIndex);

          setProducts(paginatedProducts);
          setTotalProducts(fetched.length);
        } else {
          console.error("Failed to fetch Shopify products:", data.error);
          setProducts([]);
          setTotalProducts(0);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Poll for updates periodically (30s) to refresh stock/status
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeSource, currentPage, searchTerm, activeTab, statusFilter, categoryFilter]);

  // Persist activeSource to localStorage and reflect it in the URL so selection survives refresh/navigation
  useEffect(() => {
    try {
      localStorage.setItem('products.activeSource', activeSource);
      const params = new URLSearchParams(location.search);
      params.set('platform', activeSource);
      // replace current history entry so we don't push extra entries
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    } catch (e) {
      console.warn('Failed to persist activeSource', e);
    }
  }, [activeSource]);

  // Subscribe to server-sent events to update UI in real-time for Shopify
  useEffect(() => {
    if (activeSource !== 'shopify') return;
    let es;
    try {
      es = new EventSource('http://localhost:3001/api/shopify/events');
      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          // Only trigger refresh on product-related events
          if (payload?.topic && payload.topic.includes('products')) {
            console.log('[ProductsPage] SSE product event received, refreshing products');
            fetchProducts();
          }
        } catch (e) { console.error('Invalid SSE payload', e); }
      };
      es.onerror = (e) => { console.warn('SSE connection error', e); };
    } catch (e) {
      console.warn('SSE not supported or failed to connect', e);
    }

    const onRefresh = (e) => {
      // Only refresh when event comes from a Shopify product (or generic)
      const platform = e?.detail?.platform || 'shopify';
      if (platform === 'shopify') fetchProducts();
    };

    window.addEventListener('products:refresh', onRefresh);

    return () => {
      if (es) es.close();
      window.removeEventListener('products:refresh', onRefresh);
    };
  }, [activeSource]);

  // Delete product handler
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (activeSource === 'woocommerce') {
        response = await wooCommerceService.deleteProduct(productId, true);
      } else {
        response = await shopifyService.deleteProduct(productId);
      }
      
      if (response.success) {
        // Remove product from local state
        setProducts(products.filter(p => p.id !== productId));
        setTotalProducts(totalProducts - 1);
        alert(`Product "${productName}" deleted successfully!`);
      } else {
        alert(`Failed to delete product: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`Error deleting product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-[#005660]" />
              Product Inventory
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage products from WooCommerce and Shopify
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={fetchProducts}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition shadow-sm hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={async () => {
                try {
                  // Ask user for a product id to simulate, fallback to first product in list
                  let sampleId = window.prompt('Enter Shopify Product ID to simulate update (leave blank for first shopify product)');
                  if (!sampleId) {
                    const first = products.find(p => p.platform === 'shopify' || p.vendor === 'Shopify' || p.shopify_id);
                    sampleId = first?.id || first?.shopify_id;
                  }

                  if (!sampleId) {
                    alert('No Shopify product found to simulate. Please open a Shopify product or ensure some shopify products are loaded.');
                    return;
                  }

                  const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/shopify/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: 'products/update', payload: { id: Number(sampleId) } })
                  });

                  const data = await res.json();
                  if (data.success) {
                    alert('Simulated webhook broadcasted — products will refresh via SSE/poller.');
                  } else {
                    alert('Failed to simulate webhook: ' + (data.error || 'unknown'));
                  }
                } catch (e) {
                  console.error('Simulate webhook error', e);
                  alert('Simulate failed: ' + e.message);
                }
              }}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition shadow-sm hover:bg-gray-50"
            >
              <span>Simulate Webhook</span>
            </button>
            <button
              onClick={() => exportToCSV(products, activeSource)}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition shadow-sm hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => navigate(`/add-product?platform=${activeSource}`)}
              className="flex items-center justify-center gap-2 bg-[#005660] text-white px-4 py-2.5 rounded-lg hover:bg-[#00444d] transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Source Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveSource("woocommerce");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSource === "woocommerce"
                  ? "bg-[#005660] text-white shadow-md"
                  : "text-gray-600"
              }`}
            >
              WooCommerce
            </button>
            <button
              onClick={() => {
                setActiveSource("shopify");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSource === "shopify"
                  ? "bg-[#005660] text-white shadow-md"
                  : "text-gray-600"
              }`}
            >
              Shopify
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar (Enhanced Design) */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-xl p-4 mb-6 shadow-lg border border-gray-700">
        <div className="space-y-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: totalProducts },
              { key: 'active', label: 'Active', count: products.filter(p => p.status === 'publish' || p.status === 'Active').length },
              { key: 'draft', label: 'Draft', count: products.filter(p => p.status === 'draft' || p.status === 'Draft').length },
              { key: 'archived', label: 'Archived', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'bg-[#005660] text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Filter Dropdowns and Actions */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <select
                aria-label="Status filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-black/40 text-gray-200 border border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005660] cursor-pointer hover:bg-black/60 transition"
              >
                <option value="all">All Statuses</option>
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button 
                onClick={() => {
                  // Route to unified category page with platform state
                  navigate('/category', { state: { platform: activeSource } });
                }}
                className="flex items-center justify-center gap-2 bg-[#005660] text-white px-4 py-2.5 rounded-lg hover:bg-[#00444d] transition shadow-md font-medium text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-[#005660] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr 
                    key={product.id} 
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDetailModalOpen(true);
                    }}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image || product.images?.[0] ? (
                          <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center"
                          style={{ display: product.image || product.images?.[0] ? 'none' : 'flex' }}
                        >
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.categories}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${parseFloat(product.price || product.regular_price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock_status === 'instock' 
                          ? 'bg-green-100 text-green-800'
                          : product.stock_status === 'outofstock'
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock_status === 'instock' ? 'In Stock' : 
                         product.stock_status === 'outofstock' ? 'Out of Stock' : 
                         'Limited Stock'}
                      </span>
                      {product.stock_quantity && (
                        <div className="text-xs text-gray-500 mt-1">
                          Qty: {product.stock_quantity}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === 'Active' || product.status === 'publish'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/edit-product/${product.id}?platform=${activeSource}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalProducts)}
                </span>
                {' '}of <span className="font-medium">{totalProducts}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {selectedProduct.image || selectedProduct.images?.[0] ? (
                  <img
                    src={selectedProduct.image || selectedProduct.images?.[0]}
                    alt={selectedProduct.name}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-500">ID: {selectedProduct.id || selectedProduct.shopify_id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">SKU</label>
                  <p className="text-gray-900">{selectedProduct.sku || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Price</label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(selectedProduct.price || selectedProduct.regular_price || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedProduct.status === 'Active' || selectedProduct.status === 'publish'
                        ? 'bg-green-100 text-green-800'
                        : selectedProduct.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>
              </div>

              {/* Inventory & Stock */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Stock Status</label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProduct.stock_status === 'instock'
                        ? 'bg-green-100 text-green-800'
                        : selectedProduct.stock_status === 'outofstock'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedProduct.stock_status === 'instock'
                      ? 'In Stock'
                      : selectedProduct.stock_status === 'outofstock'
                      ? 'Out of Stock'
                      : 'Limited Stock'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <p className="text-gray-900">{selectedProduct.stock_quantity || 0} units</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Categories</label>
                  <p className="text-gray-900">{selectedProduct.categories || '-'}</p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <div
                    className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                  />
                </div>
              )}

              {/* Tags */}
              {selectedProduct.tags && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(selectedProduct.tags.split(',') || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Images ({selectedProduct.images.length})</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-24 rounded-lg object-cover border border-gray-200 hover:border-gray-400 transition"
                        onError={(e) => {
                          e.target.style.opacity = '0.5';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Variants/Attributes */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Variants ({selectedProduct.variants.length})</label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left">SKU</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Title</th>
                          <th className="border border-gray-200 px-3 py-2 text-right">Price</th>
                          <th className="border border-gray-200 px-3 py-2 text-right">Quantity</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProduct.variants.map((variant, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-3 py-2">{variant.sku || '-'}</td>
                            <td className="border border-gray-200 px-3 py-2">{variant.title || '-'}</td>
                            <td className="border border-gray-200 px-3 py-2 text-right">
                              ${parseFloat(variant.price || 0).toFixed(2)}
                            </td>
                            <td className="border border-gray-200 px-3 py-2 text-right">
                              {variant.inventory_quantity || 0}
                            </td>
                            <td className="border border-gray-200 px-3 py-2 text-xs">
                              {[variant.option1, variant.option2, variant.option3]
                                .filter(Boolean)
                                .join(', ') || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Type & Vendor */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Product Type</label>
                  <p className="text-gray-900">{selectedProduct.type || selectedProduct.product_type || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Vendor</label>
                  <p className="text-gray-900">{selectedProduct.vendor || '-'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => navigate(`/edit-product/${selectedProduct.id}?platform=${activeSource}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Edit Product
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Tag, Calendar, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import shopifyService from '../services/shopifyService';

const ShopifyProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchProductDetails();

    // Subscribe to SSE to refresh this product when webhook events arrive
    let es;
    try {
      es = new EventSource(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/shopify/events`);
      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data?.topic && data.topic.includes('products')) {
            // payload may contain id or product_id
            const pid = data.payload?.id || data.payload?.product_id;
            if (!pid || String(pid) === String(id)) {
              console.log('[ShopifyProductDetail] SSE product event received, refreshing');
              fetchProductDetails();
            }
          }
        } catch (e) { console.error('Invalid SSE payload', e); }
      };
      es.onerror = (err) => { console.warn('SSE connection error (ShopifyProductDetail)', err); };
    } catch (e) {
      console.warn('SSE not supported by browser or failed to connect', e);
    }

    return () => { if (es) es.close(); };
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await shopifyService.getProductById(id);
      if (response.success) {
        setProduct(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch product details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await shopifyService.deleteProduct(id);
      if (response.success) {
        alert('Product deleted successfully');
        navigate(-1);
      } else {
        alert('Failed to delete product: ' + response.error);
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Package className="w-12 h-12 text-[#005660]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Product ID: {product.id}</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => navigate(`/edit-product/${id}`)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Product
                  </button>
                  <button
                    onClick={async () => {
                      // simulate webhook for this product
                      try {
                        const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/shopify/simulate`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ topic: 'products/update', payload: { id: Number(id) } })
                        });
                        const data = await resp.json();
                        if (data.success) {
                          alert('Simulated webhook sent for this product — UI will refresh via SSE');
                        } else {
                          alert('Failed to simulate webhook: ' + (data.error || 'unknown'));
                        }
                      } catch (e) {
                        console.error('Simulation error', e);
                        alert('Simulation failed: ' + e.message);
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Simulate webhook update
                  </button>
                  <a
                    href={`https://${product.shopDomain || 'shopify.com'}/admin/products/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Shopify
                  </a>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {product.images.map((image, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'variants', label: 'Variants' },
                  { key: 'description', label: 'Description' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.key
                        ? 'border-[#005660] text-[#005660]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="text-lg font-medium text-gray-900">{product.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vendor</p>
                        <p className="text-lg font-medium text-gray-900">{product.vendor || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Slug</p>
                      <p className="text-lg font-medium text-gray-900 font-mono">{product.slug}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'variants' && (
                  <div className="space-y-4">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-4">
                        {product.variants.map((variant, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">SKU</p>
                                <p className="font-mono font-semibold">{variant.sku || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Price</p>
                                <p className="font-semibold">${parseFloat(variant.price || 0).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Quantity</p>
                                <p className="font-semibold">{variant.inventory_quantity || 0}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  variant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {variant.available ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No variants available</p>
                    )}
                  </div>
                )}

                {activeTab === 'description' && (
                  <div className="prose prose-sm max-w-none">
                    {product.description ? (
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                      <p className="text-gray-500">No description available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Key Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {product.status}
              </span>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Price</p>
                  <p className="text-2xl font-bold text-gray-900">${parseFloat(product.price || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Inventory
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Stock Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-1 ${
                    product.stock_status === 'instock' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Quantity</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{product.stock_quantity}</p>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </h3>
              {product.categories ? (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {product.categories}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories assigned</p>
              )}
            </div>

            {/* SKU Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">SKU</h3>
              <p className="font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200">
                {product.sku}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifyProductDetail;

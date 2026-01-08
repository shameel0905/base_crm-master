import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, DollarSign, Package, Truck, Tag, FolderOpen, Eye, Image as ImageIcon, AlertCircle, Loader } from "lucide-react";
import wooCommerceService from "../services/woocommerceService";
import { useProducts } from "../context/ProductsContext";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const platform = (new URLSearchParams(location.search).get('platform')) || localStorage.getItem('products.activeSource') || 'woocommerce';
  const { products } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to find in local products context first
        let localProduct = products.find(p => p.id === parseInt(id) || p.woocommerce_id === parseInt(id));

        // Fetch from WooCommerce if not found locally
        if (!localProduct) {
          const response = await wooCommerceService.getProduct(id);
          if (response.success && response.product) {
            localProduct = response.product;
          } else {
            throw new Error(response.error || "Product not found");
          }
        }

        setProduct(localProduct);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#005660' }} />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(`/products?platform=${platform}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Product</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(`/products?platform=${platform}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">Product not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to strip HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const stripedDescription = stripHtmlTags(product.description);
  const stripedShortDescription = stripHtmlTags(product.short_description);

  // Detail sections
  const GeneralDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Product Type</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : "N/A"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">SKU</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 font-mono">
            {product.sku || "N/A"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            product.status === 'publish' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : "N/A"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Virtual Product</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {product.virtual ? "Yes" : "No"}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Downloadable Product</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {product.downloadable ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );

  const PricingDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Regular Price</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {product.regular_price ? parseFloat(product.regular_price).toFixed(2) : "N/A"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sale Price</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {product.sale_price ? parseFloat(product.sale_price).toFixed(2) : "N/A"}
          </div>
        </div>
      </div>

      {product.regular_price && product.sale_price && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm text-blue-900">
            Discount: <span className="font-semibold">
              {(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );

  const InventoryDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Manage Stock</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {product.manage_stock ? "Yes" : "No"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {product.stock_quantity !== null && product.stock_quantity !== undefined ? product.stock_quantity : "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Status</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.stock_status === 'instock'
                ? 'bg-green-100 text-green-800'
                : product.stock_status === 'outofstock'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {product.stock_status ? product.stock_status.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + product.stock_status.slice(1) : "N/A"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Backorders</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {product.backorders ? product.backorders.charAt(0).toUpperCase() + product.backorders.slice(1) : "Not allowed"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sold Individually</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {product.sold_individually ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );

  const ShippingDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {product.weight || "N/A"}
        </div>
      </div>

      {product.dimensions && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-4">
            {["length", "width", "height"].map((dim) => (
              <div key={dim} className="space-y-1">
                <label className="text-xs text-gray-500 capitalize">{dim}</label>
                <div className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                  {product.dimensions[dim] || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Shipping Class</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {product.shipping_class || "None"}
        </div>
      </div>
    </div>
  );

  const CategoriesDetails = () => (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">Categories</label>
      {product.categories && product.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.categories.map((cat, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'rgba(0,86,96,0.1)', color: '#005660', border: '1px solid rgba(0,86,96,0.2)' }}
            >
              {typeof cat === "string" ? cat : cat.name}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No categories assigned</div>
      )}

      <div className="border-t border-gray-300 pt-4 mt-4">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        {product.tags && product.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {typeof tag === "string" ? tag : tag.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 mt-3">No tags assigned</div>
        )}
      </div>
    </div>
  );

  const AttributesDetails = () => (
    <div className="space-y-4">
      {product.attributes && product.attributes.length > 0 ? (
        product.attributes.map((attr, index) => (
          <div key={index} className="border border-gray-300 rounded p-4">
            <h4 className="font-medium text-gray-900 mb-3">{attr.name}</h4>
            <div className="flex flex-wrap gap-2">
              {attr.options && attr.options.length > 0 ? (
                attr.options.map((option, optIndex) => (
                  <span
                    key={optIndex}
                    className="inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-800 border border-gray-300"
                  >
                    {option}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No options</span>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p>• {attr.visible ? "Visible" : "Hidden"}</p>
              <p>• {attr.variation ? "Used for variations" : "Not used for variations"}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No attributes defined</div>
      )}
    </div>
  );

  const VariationsDetails = () => (
    <div className="space-y-4">
      {product.type === "variable" && product.variations && product.variations.length > 0 ? (
        product.variations.map((variation, index) => (
          <div key={index} className="border border-gray-300 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Variation #{variation.id || index + 1}
              </h4>
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0,86,96,0.1)', color: '#005660' }}>
                SKU: {variation.sku || "N/A"}
              </span>
            </div>

            {variation.attributes && variation.attributes.length > 0 && (
              <div className="mb-3 space-y-1 text-sm">
                {variation.attributes.map((attr, attrIndex) => (
                  <p key={attrIndex} className="text-gray-600">
                    <span className="font-medium text-gray-700">{attr.name}:</span> {attr.option}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs text-gray-600">Regular Price</label>
                <div className="text-gray-900 font-medium">${parseFloat(variation.regular_price || 0).toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Sale Price</label>
                <div className="text-gray-900 font-medium">${parseFloat(variation.sale_price || 0).toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Stock</label>
                <div className="text-gray-900 font-medium">{variation.stock_quantity || "N/A"}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Status</label>
                <div className="text-gray-900 font-medium capitalize">{variation.stock_status || "N/A"}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No variations defined</div>
      )}
    </div>
  );

  const ImagesDetails = () => (
    <div className="space-y-4">
      {product.images && product.images.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <div key={index} className="space-y-2">
              <img
                src={image.src}
                alt={image.name || `Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded border border-gray-300"
              />
              {index === 0 && (
                <span className="text-xs px-2 py-1 rounded inline-block" style={{ backgroundColor: 'rgba(0,86,96,0.1)', color: '#005660' }}>
                  Main Image
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-300 rounded p-8 text-center">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 text-sm">No images uploaded</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/products?platform=${platform}`)}
              className="flex items-center gap-2 px-3 py-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1">Product Details (Read-Only)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.status === 'publish'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : "Draft"}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(0,86,96,0.1)', color: '#005660' }}>
              SKU: {product.sku}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description Section */}
            {(stripedDescription || stripedShortDescription) && (
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="border-b border-gray-300 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                </div>
                <div className="p-6 space-y-6">
                  {stripedShortDescription && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Short Description</h3>
                      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-gray-900 text-sm leading-relaxed">
                        {stripedShortDescription}
                      </div>
                    </div>
                  )}
                  {stripedDescription && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Full Description</h3>
                      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                        {stripedDescription}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images Section */}
            {product.images && product.images.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="border-b border-gray-300 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Product Images
                  </h2>
                </div>
                <div className="p-6">
                  <ImagesDetails />
                </div>
              </div>
            )}

            {/* Tabs Section */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300">
                <div className="flex flex-wrap">
                  {[
                    { id: "general", label: "General", icon: Package },
                    { id: "pricing", label: "Pricing", icon: DollarSign },
                    { id: "inventory", label: "Inventory", icon: Package },
                    { id: "shipping", label: "Shipping", icon: Truck },
                    { id: "categories", label: "Categories", icon: FolderOpen },
                    { id: "attributes", label: "Attributes", icon: Tag },
                    { id: "variations", label: "Variations", icon: Package },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                          activeTab === tab.id
                            ? 'text-[#005660] border-[#005660]'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "general" && <GeneralDetails />}
                {activeTab === "pricing" && <PricingDetails />}
                {activeTab === "inventory" && <InventoryDetails />}
                {activeTab === "shipping" && <ShippingDetails />}
                {activeTab === "categories" && <CategoriesDetails />}
                {activeTab === "attributes" && <AttributesDetails />}
                {activeTab === "variations" && <VariationsDetails />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta Information */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Meta Information</h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-600">Product ID</label>
                  <div className="text-gray-900 font-mono mt-1">{product.id}</div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <label className="text-xs font-medium text-gray-600">Product Type</label>
                  <div className="text-gray-900 capitalize mt-1">{product.type}</div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <label className="text-xs font-medium text-gray-600">Tax Status</label>
                  <div className="text-gray-900 capitalize mt-1">{product.tax_status || "N/A"}</div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <label className="text-xs font-medium text-gray-600">Tax Class</label>
                  <div className="text-gray-900 capitalize mt-1">{product.tax_class || "Standard"}</div>
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visibility
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">Featured Product</label>
                  <span className="font-medium text-gray-900">{product.featured ? "Yes" : "No"}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <label className="text-gray-700">Catalog Visibility</label>
                  <span className="font-medium text-gray-900 capitalize">{product.catalog_visibility || "Visible"}</span>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            {(product.date_created || product.date_modified) && (
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">Dates</h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  {product.date_created && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Created</label>
                      <div className="text-gray-900 mt-1">
                        {new Date(product.date_created).toLocaleDateString()} {new Date(product.date_created).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                  {product.date_modified && (
                    <div className="border-t border-gray-200 pt-3">
                      <label className="text-xs font-medium text-gray-600">Last Modified</label>
                      <div className="text-gray-900 mt-1">
                        {new Date(product.date_modified).toLocaleDateString()} {new Date(product.date_modified).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={() => navigate(`/edit-product/${product.id || product.woocommerce_id}`)}
              className="w-full px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#005660' }}
            >
              <Package className="w-4 h-4" />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

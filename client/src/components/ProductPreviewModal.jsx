import React, { useState } from "react";
import { X, DollarSign, Package, Truck, FolderOpen, Tag, Image as ImageIcon, Eye } from "lucide-react";

export function ProductPreviewModal({ isOpen, onClose, productData }) {
  const [activeTab, setActiveTab] = useState("general");

  if (!isOpen) return null;

  // Helper function to strip HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const stripedDescription = stripHtmlTags(productData.description);
  const stripedShortDescription = stripHtmlTags(productData.shortDescription);

  // Detail sections
  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Product Type</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {productData.productType ? productData.productType.charAt(0).toUpperCase() + productData.productType.slice(1) : "N/A"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">SKU</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 font-mono">
            {productData.sku || "N/A"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            productData.status === 'publish' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {productData.status ? productData.status.charAt(0).toUpperCase() + productData.status.slice(1) : "Draft"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">


      </div>
    </div>
  );

  const PricingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Regular Price</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {productData.regularPrice ? parseFloat(productData.regularPrice).toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sale Price</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {productData.salePrice ? parseFloat(productData.salePrice).toFixed(2) : "0.00"}
          </div>
        </div>
      </div>

      {productData.regularPrice && productData.salePrice && parseFloat(productData.regularPrice) > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm text-blue-900">
            Discount: <span className="font-semibold">
              {(((parseFloat(productData.regularPrice) - parseFloat(productData.salePrice)) / parseFloat(productData.regularPrice)) * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tax Status</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 capitalize">
          {productData.taxStatus || "Taxable"}
        </div>
      </div>
    </div>
  );

  const InventoryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Manage Stock</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {productData.manageStock ? "Yes" : "No"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {productData.manageStock ? (productData.stockQuantity || "0") : "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Status</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              productData.stockStatus === 'instock'
                ? 'bg-green-100 text-green-800'
                : productData.stockStatus === 'outofstock'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {productData.stockStatus ? productData.stockStatus.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + productData.stockStatus.slice(1) : "In stock"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Backorders</label>
          <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
            {productData.backorders ? productData.backorders.charAt(0).toUpperCase() + productData.backorders.slice(1) : "Not allowed"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sold Individually</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {productData.soldIndividually ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );

  const ShippingTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {productData.weight || "N/A"}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Dimensions (cm)</label>
        <div className="grid grid-cols-3 gap-4">
          {["length", "width", "height"].map((dim) => (
            <div key={dim} className="space-y-1">
              <label className="text-xs text-gray-500 capitalize">{dim}</label>
              <div className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {productData.dimensions && productData.dimensions[dim] ? productData.dimensions[dim] : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Shipping Class</label>
        <div className="bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900">
          {productData.shippingClass || "None"}
        </div>
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Categories</label>
        {productData.categories && productData.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {productData.categories.map((cat, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'rgba(0,86,96,0.1)', color: '#005660', border: '1px solid rgba(0,86,96,0.2)' }}
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 mt-3 text-sm">No categories assigned</div>
        )}
      </div>

      <div className="border-t border-gray-300 pt-4">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        {productData.tags && productData.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {productData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 mt-3 text-sm">No tags assigned</div>
        )}
      </div>
    </div>
  );

  const AttributesTab = () => (
    <div className="space-y-4">
      {productData.attributes && productData.attributes.length > 0 ? (
        productData.attributes.map((attr, index) => (
          <div key={index} className="border border-gray-300 rounded p-4">
            <h4 className="font-medium text-gray-900 mb-3">{attr.name}</h4>
            <div className="flex flex-wrap gap-2">
              {attr.values && attr.values.length > 0 ? (
                attr.values.map((value, valIndex) => (
                  <span
                    key={valIndex}
                    className="inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-800 border border-gray-300"
                  >
                    {value}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No values</span>
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

  const VariationsTab = () => (
    <div className="space-y-4">
      {productData.productType === "variable" && productData.variations && productData.variations.length > 0 ? (
        productData.variations.map((variation, index) => (
          <div key={index} className="border border-gray-300 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                {variation.attributes.map(attr => attr.value).join(' - ') || `Variation ${index + 1}`}
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${variation.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {variation.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {variation.attributes && variation.attributes.length > 0 && (
              <div className="mb-3 space-y-1 text-sm">
                {variation.attributes.map((attr, attrIndex) => (
                  <p key={attrIndex} className="text-gray-600">
                    <span className="font-medium text-gray-700">{attr.name}:</span> {attr.value}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs text-gray-600">Regular Price</label>
                <div className="text-gray-900 font-medium">${parseFloat(variation.regularPrice || 0).toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Sale Price</label>
                <div className="text-gray-900 font-medium">${parseFloat(variation.salePrice || 0).toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">SKU</label>
                <div className="text-gray-900 font-medium">{variation.sku || "N/A"}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Stock</label>
                <div className="text-gray-900 font-medium">{variation.stockQuantity || "0"}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No variations defined</div>
      )}
    </div>
  );

  const ImagesTab = () => (
    <div className="space-y-4">
      {productData.images && productData.images.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {productData.images.map((image, index) => (
            <div key={index} className="space-y-2">
              <img
                src={image.url}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{productData.title || "Product Preview"}</h2>
            <p className="text-sm text-gray-500 mt-1">Live Preview - Changes will be shown when you save</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Description Section */}
          {(stripedDescription || stripedShortDescription) && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg mb-6 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
              
              {stripedShortDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Short Description</label>
                  <div className="bg-white border border-gray-300 rounded p-4 text-gray-900 text-sm leading-relaxed">
                    {stripedShortDescription || "No short description"}
                  </div>
                </div>
              )}
              
              {stripedDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Full Description</label>
                  <div className="bg-white border border-gray-300 rounded p-4 text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {stripedDescription || "No description"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Images Section */}
          {productData.images && productData.images.length > 0 && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg mb-6 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Images
              </h3>
              <ImagesTab />
            </div>
          )}

          {/* Tabs Section */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-300 bg-gray-50">
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
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? 'text-[#005660] border-[#005660] bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === "general" && <GeneralTab />}
              {activeTab === "pricing" && <PricingTab />}
              {activeTab === "inventory" && <InventoryTab />}
              {activeTab === "shipping" && <ShippingTab />}
              {activeTab === "categories" && <CategoriesTab />}
              {activeTab === "attributes" && <AttributesTab />}
              {activeTab === "variations" && <VariationsTab />}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPreviewModal;

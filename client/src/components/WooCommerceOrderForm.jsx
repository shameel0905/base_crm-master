import React, { useState } from "react";
import { X, Plus, Search, Package } from "lucide-react";

export function WooCommerceOrderForm() {
  const [orderData, setOrderData] = useState({
    dateCreated: new Date().toISOString().split('T')[0],
    hour: new Date().getHours().toString().padStart(2, '0'),
    minute: new Date().getMinutes().toString().padStart(2, '0'),
    status: "pending-payment",
    customer: "guest",
    billing: {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      email: "",
      phone: "",
    },
    shipping: {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    },
    lineItems: [],
  });

  const [searchProduct, setSearchProduct] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Mock products for search
  const mockProducts = [
    { id: 1, name: "Wireless Mouse", price: 29.99, sku: "WM-001" },
    { id: 2, name: "Mechanical Keyboard", price: 89.99, sku: "KB-002" },
    { id: 3, name: "USB-C Cable", price: 12.99, sku: "CB-003" },
    { id: 4, name: "Laptop Stand", price: 45.00, sku: "LS-004" },
  ];

  const statusOptions = [
    { value: "pending-payment", label: "Pending payment" },
    { value: "processing", label: "Processing" },
    { value: "on-hold", label: "On hold" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" },
  ];

  const handleInputChange = (section, field, value) => {
    if (section === "general") {
      setOrderData(prev => ({ ...prev, [field]: value }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const addLineItem = (product) => {
    setOrderData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          total: product.price,
        }
      ]
    }));
    setShowProductSearch(false);
    setSearchProduct("");
  };

  const updateLineItem = (id, field, value) => {
    setOrderData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updated.total = (updated.quantity || 0) * (updated.price || 0);
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const removeLineItem = (id) => {
    setOrderData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const copyBillingToShipping = () => {
    setOrderData(prev => ({
      ...prev,
      shipping: {
        firstName: prev.billing.firstName,
        lastName: prev.billing.lastName,
        company: prev.billing.company,
        address1: prev.billing.address1,
        address2: prev.billing.address2,
        city: prev.billing.city,
        state: prev.billing.state,
        postcode: prev.billing.postcode,
        country: prev.billing.country,
      }
    }));
  };

  const calculateSubtotal = () => {
    return orderData.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Add shipping, tax, etc. here if needed
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="w-full">  

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content - Left Side (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-8 pb-6 border-b">Order #{Math.floor(Math.random() * 100000)} details</h2>

                {/* General Section */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">General</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date created:</label>
                      <input
                        type="date"
                        value={orderData.dateCreated}
                        onChange={(e) => handleInputChange("general", "dateCreated", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time:</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={orderData.hour}
                            onChange={(e) => handleInputChange("general", "hour", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="HH"
                          />
                          <p className="text-xs text-gray-500 text-center mt-1">Hours</p>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={orderData.minute}
                            onChange={(e) => handleInputChange("general", "minute", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="MM"
                          />
                          <p className="text-xs text-gray-500 text-center mt-1">Minutes</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                      <select
                        value={orderData.status}
                        onChange={(e) => handleInputChange("general", "status", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer:</label>
                      <select
                        value={orderData.customer}
                        onChange={(e) => handleInputChange("general", "customer", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="guest">Guest</option>
                        <option value="existing">Existing Customer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Billing Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name:</label>
                      <input
                        type="text"
                        value={orderData.billing.firstName}
                        onChange={(e) => handleInputChange("billing", "firstName", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name:</label>
                      <input
                        type="text"
                        value={orderData.billing.lastName}
                        onChange={(e) => handleInputChange("billing", "lastName", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company:</label>
                      <input
                        type="text"
                        value={orderData.billing.company}
                        onChange={(e) => handleInputChange("billing", "company", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                      <input
                        type="email"
                        value={orderData.billing.email}
                        onChange={(e) => handleInputChange("billing", "email", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone:</label>
                      <input
                        type="tel"
                        value={orderData.billing.phone}
                        onChange={(e) => handleInputChange("billing", "phone", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address:</label>
                      <input
                        type="text"
                        value={orderData.billing.address1}
                        onChange={(e) => handleInputChange("billing", "address1", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2:</label>
                      <input
                        type="text"
                        value={orderData.billing.address2}
                        onChange={(e) => handleInputChange("billing", "address2", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City:</label>
                      <input
                        type="text"
                        value={orderData.billing.city}
                        onChange={(e) => handleInputChange("billing", "city", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country:</label>
                      <input
                        type="text"
                        value={orderData.billing.country}
                        onChange={(e) => handleInputChange("billing", "country", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Shipping Information</h3>
                    <button
                      onClick={copyBillingToShipping}
                      className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                    >
                      Copy from billing
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name:</label>
                      <input
                        type="text"
                        value={orderData.shipping.firstName}
                        onChange={(e) => handleInputChange("shipping", "firstName", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name:</label>
                      <input
                        type="text"
                        value={orderData.shipping.lastName}
                        onChange={(e) => handleInputChange("shipping", "lastName", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address:</label>
                      <input
                        type="text"
                        value={orderData.shipping.address1}
                        onChange={(e) => handleInputChange("shipping", "address1", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City:</label>
                      <input
                        type="text"
                        value={orderData.shipping.city}
                        onChange={(e) => handleInputChange("shipping", "city", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country:</label>
                      <input
                        type="text"
                        value={orderData.shipping.country}
                        onChange={(e) => handleInputChange("shipping", "country", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-4 border-b">Order Items</h3>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Product</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">Price</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">Qty</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">Total</th>
                        <th className="text-center text-xs font-semibold text-gray-700 px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.lineItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-1">SKU: {item.sku}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              ${item.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                              title="Remove item"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {orderData.lineItems.length === 0 && (
                  <div className="py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No items added yet. Click "Add item(s)" to get started.</p>
                  </div>
                )}

                {/* Totals Section */}
                <div className="mt-8 pt-6 border-t flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items Subtotal:</span>
                      <span className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold bg-blue-50 px-4 py-3 rounded-md border border-blue-100">
                      <span className="text-gray-900">Order Total:</span>
                      <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowProductSearch(true)}
                    className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add item(s)
                  </button>
                  <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">
                    Apply coupon
                  </button>
                </div>

                {/* Product Search Modal */}
                {showProductSearch && (
                  <div className="mt-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Search for a product by name or SKU..."
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setShowProductSearch(false);
                          setSearchProduct("");
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {mockProducts
                        .filter(p => 
                          searchProduct === "" || 
                          p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchProduct.toLowerCase())
                        )
                        .map(product => (
                          <button
                            key={product.id}
                            onClick={() => addLineItem(product)}
                            className="w-full text-left px-4 py-3 hover:bg-white rounded-md border border-transparent hover:border-blue-300 transition bg-white"
                          >
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              SKU: {product.sku} • ${product.price.toFixed(2)}
                            </div>
                          </button>
                        ))}
                      {mockProducts.filter(p => 
                        searchProduct === "" || 
                        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchProduct.toLowerCase())
                      ).length === 0 && (
                        <div className="py-6 text-center text-gray-500 text-sm">
                          No products found matching "{searchProduct}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order actions</h3>
              <select className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Choose an action...</option>
                <option>Email invoice</option>
                <option>Send order details</option>
                <option>Regenerate download permissions</option>
              </select>
              <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
                Create Order
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Items:</span>
                  <span className="font-semibold text-blue-900">{orderData.lineItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Status:</span>
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full font-medium">
                    {statusOptions.find(o => o.value === orderData.status)?.label}
                  </span>
                </div>
                <div className="pt-3 border-t border-blue-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Attribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order attribution</h3>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Origin</label>
                <p className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md">Unknown</p>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order notes</h3>
              <p className="text-sm text-gray-500 mb-4">Add notes about this order for internal reference.</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition">
                <Plus className="w-4 h-4" /> Add note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WooCommerceOrderForm;

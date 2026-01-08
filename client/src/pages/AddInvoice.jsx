import { useState } from "react";

const AddInvoice = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lockPrices, setLockPrices] = useState(false);
  
  // Form state
  const [invoiceData, setInvoiceData] = useState({
    to: "david@gmail.com",
    from: '"My store" <cwc@gmail.com>',
    invoiceName: "",
    customMessage: ""
  });

  // Sample invoice items data
  const invoiceItems = [
    { id: 1, description: "Website Design", quantity: 1, price: 1200, amount: 1200 },
    { id: 2, description: "Hosting (1 year)", quantity: 1, price: 300, amount: 300 },
    { id: 3, description: "SEO Optimization", quantity: 1, price: 500, amount: 500 }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReviewInvoice = () => {
    console.log("Review Invoice clicked"); // Debug log
    setShowInvoiceModal(false);
    setShowReviewModal(true);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add Invoice</h2>
            <p className="text-sm text-gray-600">Create and send a new invoice</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">CWC</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invoice Dashboard</h3>
              <button 
                onClick={() => setShowInvoiceModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Invoice
              </button>
            </div>
            <p className="text-gray-600">Click the button above to create a new invoice</p>
          </div>
        </main>
      </div>

      {/* Invoice Creation Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Invoice</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* To and From Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="to" className="text-sm font-medium text-gray-900">
                    To
                  </label>
                  <input
                    id="to"
                    type="email"
                    value={invoiceData.to}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="from" className="text-sm font-medium text-gray-900">
                    From
                  </label>
                  <input
                    id="from"
                    type="email"
                    value={invoiceData.from}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Invoice Name */}
              <div className="space-y-2">
                <label htmlFor="invoiceName" className="text-sm font-medium text-gray-900">
                  Invoice (name)
                </label>
                <input
                  id="invoiceName"
                  type="text"
                  value={invoiceData.invoiceName}
                  onChange={handleInputChange}
                  placeholder="Invoice (name)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <label htmlFor="customMessage" className="text-sm font-medium text-gray-900">
                  Custom message (optional)
                </label>
                <textarea
                  id="customMessage"
                  value={invoiceData.customMessage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                  placeholder="Enter your custom message here..."
                />
              </div>

              {/* Product Prices Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔒</span>
                    <span className="text-sm font-medium text-gray-900">Product prices</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lock all product prices so they don't change.
                  </p>
                </div>
                <button
                  onClick={() => setLockPrices(!lockPrices)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lockPrices ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      lockPrices ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReviewInvoice}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Invoice Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Review Invoice</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">From:</h4>
                  <p className="text-gray-700">{invoiceData.from}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">To:</h4>
                  <p className="text-gray-700">{invoiceData.to}</p>
                </div>
              </div>

              {/* Invoice Details */}
              {invoiceData.invoiceName && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Invoice:</h4>
                  <p className="text-gray-700">{invoiceData.invoiceName}</p>
                </div>
              )}

              {/* Custom Message */}
              {invoiceData.customMessage && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Message:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{invoiceData.customMessage}</p>
                </div>
              )}

              {/* Invoice Items Table */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h4>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Lock Prices Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <span className="text-sm font-medium text-gray-900">
                    Product prices are {lockPrices ? 'locked' : 'unlocked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setShowInvoiceModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  Send Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInvoice;   
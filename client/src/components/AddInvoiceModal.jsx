import { useState } from "react";
import { X } from "lucide-react";


const AddInvoiceModal = ({ open, onClose }) => {
  const [lockPrices, setLockPrices] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-white bg-opacity-0  flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Send Invoice</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* To and From Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="to" className="text-sm font-medium text-foreground">
                To
              </label>
              <input
                id="to"
                defaultValue="david@gmail.com"
                className="rounded-lg border border-gray-300 px-3 py-2 w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="from" className="text-sm font-medium text-foreground">
                From
              </label>
              <input
                id="from"
                defaultValue='"My store" <cwc@gmail.com>'
                className="rounded-lg border border-gray-300 px-3 py-2 w-full"
              />
            </div>
          </div>
          {/* Invoice Name */}
          <div className="space-y-2">
            <label htmlFor="invoice-name" className="text-sm font-medium text-foreground">
              Invoice (name)
            </label>
            <input
              id="invoice-name"
              placeholder="Invoice (name)"
              className="rounded-lg border border-gray-300 px-3 py-2 w-full"
            />
          </div>
          {/* Custom Message */}
          <div className="space-y-2">
            <label htmlFor="custom-message" className="text-sm font-medium text-foreground">
              Custom message (optional)
            </label>
            <textarea
              id="custom-message"
              className="rounded-lg min-h-[80px] resize-none border border-gray-300 px-3 py-2 w-full"
              placeholder="Enter your custom message here..."
            />
          </div>
          {/* Product Prices Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-foreground">🔒</div>
                <span className="text-sm font-medium text-foreground">Product prices</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Lock all product prices so they don't change.
              </p>
            </div>
            {/* Custom Switch */}
            <button
              type="button"
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${lockPrices ? 'bg-[#005660]' : 'bg-gray-300'}`}
              onClick={() => setLockPrices(v => !v)}
              aria-pressed={lockPrices}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${lockPrices ? 'translate-x-4' : ''}`}
              />
            </button>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#005660] text-white font-medium hover:opacity-90"
          >
            Review Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal;

import React, { useState, useEffect } from "react";

export default function AddDiscountModal({ isOpen, onClose, onApply, initialDiscount }) {
  const [discountType, setDiscountType] = useState("Amount");
  const [discountValue, setDiscountValue] = useState("20.00");
  const [reason, setReason] = useState("");
  const [customDiscount, setCustomDiscount] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // if editing an existing discount, prefill values
      if (initialDiscount) {
        const type = initialDiscount.type || "Amount";
        setDiscountType(type);
        if (initialDiscount.value != null) {
          setDiscountValue(type === "Amount" ? Number(initialDiscount.value).toFixed(2) : String(initialDiscount.value));
        } else {
          setDiscountValue(type === "Amount" ? "0.00" : "0");
        }
        setReason(initialDiscount.reason || "");
        setCustomDiscount(!!initialDiscount.custom);
      } else {
        setDiscountType("Amount");
        setDiscountValue("20.00");
        setReason("");
        setCustomDiscount(true);
      }
    }
  }, [isOpen, initialDiscount]);

  if (!isOpen) return null;

  const handleApply = () => {
    const val = Number(String(discountValue).replace(/[^0-9.-]/g, '')) || 0;
    const discount = {
      type: discountType,
      value: val,
      reason: reason || "",
      custom: !!customDiscount,
    };

    if (typeof onApply === "function") onApply(discount);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">Add discount</h3>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Discount</h4>
            <p className="text-sm text-gray-500 mb-3">Configure a discount for this order</p>

            <div className="mt-4 flex items-center space-x-2">
              <input
                id="custom-discount"
                type="checkbox"
                checked={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.checked)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="custom-discount" className="text-sm font-medium text-gray-700">
                Add custom order discount
              </label>
            </div>
          </div>

          {customDiscount && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Discount type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-300 rounded-md pl-3 text-sm"
                >
                  <option value="Amount">Amount</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Discount value</label>
                <div className="relative">
                  {discountType === "Amount" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  )}
                  <input
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className={`w-full h-10 border border-gray-300 rounded-md text-sm ${
                      discountType === "Amount" ? "pl-8" : "pr-8"
                    }`}
                    placeholder={discountType === "Amount" ? "0.00" : "0"}
                    type="text"
                  />
                  {discountType === "Percentage" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {customDiscount && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Reason for discount</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for discount..."
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">Your customer can see this reason</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-2 rounded-md text-sm bg-[#005660] text-white hover:bg-[#003c42]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

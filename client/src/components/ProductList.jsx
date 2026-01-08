import { Minus, Plus, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import tracksuitImg from "../assets/images/tracksuit.png";

const initialProducts = [
  { id: 1, name: "Active Track Suit", price: 45.0, quantity: 1 },
  { id: 2, name: "Performance Track Suit", price: 52.0, quantity: 1 },
  { id: 3, name: "Essential Track Suit", price: 20.0, quantity: 1 },
];

export default function ProductList({ products: productsProp, readOnly }) {
  // If productsProp is provided, use it; otherwise, use initialProducts
  const [products, setProducts] = useState(productsProp || initialProducts);

  // If productsProp changes (e.g., when selecting a new order), update local state
  useEffect(() => {
    if (productsProp) {
      setProducts(productsProp);
    }
  }, [productsProp]);

  const handleQuantityChange = (id, delta) => {
    if (readOnly) return;
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              quantity: Math.max(1, product.quantity + delta),
            }
          : product
      )
    );
  };

  const handleRemove = (id) => {
    if (readOnly) return;
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const subtotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl font-light mb-8 text-gray-800">Your Cart</h1>
      
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 pb-3 text-sm font-normal text-gray-500 border-b">
        <div className="col-span-6">Product</div>
        <div className="col-span-3 text-center">Quantity</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-1"></div>
      </div>

      {/* Product Items */}
      <div className="divide-y">
        {products.map((product) => (
          <div key={product.id} className="py-6">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Product Info */}
              <div className="col-span-6 flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image ? product.image : tracksuitImg}
                    alt={product.name}
                    className="object-cover h-full w-full"
                    onError={e => { e.target.onerror = null; e.target.src = tracksuitImg; }}
                  />
                </div>
                <div>
                  <p className="font-normal text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500 mt-1">${product.price?.toFixed ? product.price.toFixed(2) : product.price}</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="col-span-3 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => handleQuantityChange(product.id, -1)}
                    type="button"
                    disabled={readOnly}
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="w-8 text-center text-sm font-medium text-gray-700">
                    {product.quantity}
                  </span>

                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => handleQuantityChange(product.id, 1)}
                    type="button"
                    disabled={readOnly}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="col-span-2 text-right">
                <span className="font-medium text-gray-800">
                  ${(product.price * product.quantity).toFixed(2)}
                </span>
              </div>

              {/* Remove */}
              <div className="col-span-1 flex justify-end">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                  onClick={() => handleRemove(product.id)}
                  type="button"
                  disabled={readOnly}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="border-t pt-6 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-xl font-light text-gray-800">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Shipping and taxes calculated at checkout.</p>
        
        <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition">
          Checkout
        </button>
      </div>
    </div>
  );
}
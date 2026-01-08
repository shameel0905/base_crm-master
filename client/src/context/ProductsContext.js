import { createContext, useContext, useState } from "react";

const ProductsContext = createContext();

const initialProducts = [
  {
    id: 1,
    name: "Performance Track Suit",
    image: require("../assets/images/tracksuit.png"),
    status: "Active",
    inventory: "5 in Stock",
    type: "Physical",
    price: "$89.99",
    category: "Active Wear",
    vendor: "Nike",
    quantity: 1,
  },
  {
    id: 2,
    name: "Premium Yoga Pants",
    image: require("../assets/images/tracksuit.png"),
    status: "Draft",
    inventory: "0 in Stock",
    type: "Physical",
    price: "$59.99",
    category: "Active Wear",
    vendor: "Lululemon",
    quantity: 1,
  },
  {
    id: 3,
    name: "Breathable Running Shorts",
    image: require("../assets/images/tracksuit.png"),
    status: "Active",
    inventory: "12 in Stock",
    type: "Physical",
    price: "$39.99",
    category: "Active Wear",
    vendor: "Adidas",
    quantity: 1,
  },
  {
    id: 4,
    name: "Online Fitness Program",
    image: require("../assets/images/tracksuit.png"),
    status: "Archived",
    inventory: "Unlimited",
    type: "Digital",
    price: "$29.99",
    category: "Fitness",
    vendor: "FitPro",
    quantity: 1,
  },
  {
    id: 5,
    name: "Weightlifting Gloves",
    image: require("../assets/images/tracksuit.png"),
    status: "Active",
    inventory: "8 in Stock",
    type: "Physical",
    price: "$24.99",
    category: "Accessories",
    vendor: "Under Armour",
    quantity: 1,
  },
  {
    id: 6,
    name: "Hydration Backpack",
    image: require("../assets/images/tracksuit.png"),
    status: "Active",
    inventory: "3 in Stock",
    type: "Physical",
    price: "$49.99",
    category: "Accessories",
    vendor: "CamelBak",
    quantity: 1,
  },
];

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  // Add updateQuantity and removeProduct helpers
  const updateQuantity = (id, newQuantity) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, quantity: Math.max(1, newQuantity) }
          : product
      )
    );
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, setProducts, updateQuantity, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}

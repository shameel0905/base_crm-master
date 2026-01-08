
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProductsProvider } from "./context/ProductsContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Product from "./pages/Product";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ProductDetail from "./pages/ProductDetail";
import Customer from "./pages/Customer";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import AddOrder from "./pages/AddOrder";
import Category from "./pages/Category";

import TestWooCommercePage from "./components/TestWooCommercePage";
// import AddOrderCombined from "./pages/AddOrderCombined";

function App() {
  return (
    <div className="font-sans">
      <ProductsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Product />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            <Route path="/product-detail/:id" element={<ProductDetail />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/add-order" element={<AddOrder />} />
            <Route path="/category" element={<Category />} />
            <Route path="/test-woocommerce" element={<TestWooCommercePage />} />

            {/* <Route path="/add-order-combined" element={<AddOrderCombined />} /> */}

          </Routes>
        </Router>
      </ProductsProvider>
    </div>
  );
}

export default App;

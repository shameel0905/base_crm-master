import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import ProductsPage from "../components/ProductsPage";


const Products = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <DashboardHeader title="Products" />
        <ProductsPage />
      </main>
    </div>
  );
};

export default Products;
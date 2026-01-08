import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { useLocation } from "react-router-dom";
import { CategoriesPage } from "../components/ProductCategory";

const Category = () => {
  const location = useLocation();
  // Determine platform from navigation state, query param, or fallback to stored preference
  const query = new URLSearchParams(location.search);
  const platformFromQuery = query.get('platform');
  const storedPlatform = localStorage.getItem('products.activeSource');
  const platform = location.state?.platform || platformFromQuery || (storedPlatform === 'shopify' ? 'shopify' : 'woocommerce');
  
  const title = platform === 'shopify' ? 'Collections' : 'Categories';
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <DashboardHeader title={title} />
        <CategoriesPage platform={platform} />
      </main>
    </div>
  );
};

export default Category;
import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { ProductForm } from "../components/ProductForm";
import { useSearchParams } from 'react-router-dom';

const AddProduct = () => {
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') || 'woocommerce';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <DashboardHeader title="Add Product" />
        <ProductForm productPlatform={platform} />
      </main>
    </div>
  );
};

export default AddProduct;

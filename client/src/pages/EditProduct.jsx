import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { ProductForm } from "../components/ProductForm";
import { useParams, useSearchParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') || 'woocommerce';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <DashboardHeader title="Edit Existing Product" />
        <ProductForm productId={id} productPlatform={platform} />
      </main>
    </div>
  );
};

export default EditProduct;

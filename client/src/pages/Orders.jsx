
import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
// import { FilterTabs } from "../components/FilterTabs";
// import { OrdersTable } from "./OrdersTable";
import OrdersPage from "../components/Orderpages";



const Orders = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <DashboardHeader title="Orders" />

          
          <OrdersPage />  

        
        
        
      </main>
    </div>
  );
};

export default Orders;
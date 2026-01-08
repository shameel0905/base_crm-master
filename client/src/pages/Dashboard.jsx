import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { MetricCard } from "../components/MetricCard";
import { SalesChart } from "../components/SalesChart";
import { ShoppingCart, Package, DollarSign } from "lucide-react";

import { useState } from "react";

const Dashboard = () => {
  const [chartType, setChartType] = useState('sales');
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <DashboardHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 py-4 px-4">
          <MetricCard
            title="Total Sales"
            value="08"
            icon={<ShoppingCart className="w-6 h-6" />}
            variant="primary"
            active={chartType === 'sales'}
            onClick={() => setChartType('sales')}
          />
          <MetricCard
            title="Orders"
            value="19"
            icon={<Package className="w-6 h-6" />}
            active={chartType === 'orders'}
            onClick={() => setChartType('orders')}
          />
          <MetricCard
            title="Revenue"
            value="$1900.00"
            icon={<DollarSign className="w-6 h-6" />}
            active={chartType === 'revenue'}
            onClick={() => setChartType('revenue')}
          />
        </div>
        <div className="px-4">
          <SalesChart chartType={chartType} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
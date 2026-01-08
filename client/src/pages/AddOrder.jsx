import React from "react";
import { DashboardHeader } from "../components/DashboardHeader";
import { Sidebar } from "../components/Sidebar";
import WooCommerceOrderForm from "../components/WooCommerceOrderForm";

const AddOrder = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader title="Add Order" />
        <WooCommerceOrderForm />
      </div>
    </div>
  );
};

export default AddOrder;

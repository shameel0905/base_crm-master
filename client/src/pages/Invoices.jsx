import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { InvoiceTable } from "../components/InvoiceTable";

const Invoices = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64">
        <DashboardHeader title="Invoices" />

        <InvoiceTable />

      </main>
    </div>
  );
};

export default Invoices;

      
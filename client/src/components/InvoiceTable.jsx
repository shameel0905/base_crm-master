import { useState } from "react";
import { Eye, Download, Send, Trash2, Pencil } from "lucide-react";
import AddInvoiceModal from "./AddInvoiceModal";

const initialInvoices = [
  {
    id: "1",
    number: "INV-001",
    customer: "Acme Corp",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    amount: "$2,500.00",
    status: "paid",
  },
  {
    id: "2",
    number: "INV-002",
    customer: "Tech Solutions Inc",
    date: "2024-01-20",
    dueDate: "2024-02-20",
    amount: "$1,750.00",
    status: "pending",
  },
  {
    id: "3",
    number: "INV-003",
    customer: "Digital Agency",
    date: "2024-01-10",
    dueDate: "2024-02-10",
    amount: "$3,200.00",
    status: "overdue",
  },
  {
    id: "4",
    number: "INV-004",
    customer: "Startup Co",
    date: "2024-01-25",
    dueDate: "2024-02-25",
    amount: "$980.00",
    status: "draft",
  },
  {
    id: "5",
    number: "INV-005",
    customer: "Enterprise Ltd",
    date: "2024-01-18",
    dueDate: "2024-02-18",
    amount: "$4,500.00",
    status: "paid",
  },
];

const statusColors = {
  paid: "text-green-600 bg-green-50",
  pending: "text-yellow-600 bg-yellow-50",
  overdue: "text-red-600 bg-red-50",
  draft: "text-gray-600 bg-gray-50",
};

export function InvoiceTable() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const s = search.toLowerCase();
    const matchesSearch =
      inv.number.toLowerCase().includes(s) ||
      inv.customer.toLowerCase().includes(s) ||
      inv.amount.toLowerCase().includes(s) ||
      inv.status.toLowerCase().includes(s);
    const matchesStatus =
      statusFilter === "All" ? true : inv.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleEdit = (invoice) => {
    setEditId(invoice.id);
    setEditData(invoice);
  };

  const handleSave = () => {
    setInvoices((prev) => prev.map((i) => (i.id === editId ? editData : i)));
    setEditId(null);
    setEditData({});
  };


  return (
    <div className="bg-white rounded-lg border p-4 space-y-6 m-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4">
        <div className="flex items-center gap-2 justify-end w-full">
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white w-56"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
          <button
            className="bg-[#005660] hover:bg-[#00444d] text-white px-4 py-2 rounded font-medium transition"
            onClick={() => setShowAddInvoice(true)}
          >
            Add Invoice
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-black">
                <th className="p-3 text-left font-medium text-gray-100">Invoice #</th>
                <th className="p-3 text-left font-medium text-gray-100">Customer</th>
                <th className="p-3 text-left font-medium text-gray-100">Date</th>
                <th className="p-3 text-left font-medium text-gray-100">Due Date</th>
                <th className="p-3 text-left font-medium text-gray-100">Amount</th>
                <th className="p-3 text-left font-medium text-gray-100">Status</th>
                <th className="p-3 text-center font-medium text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 font-medium">
                      {editId === invoice.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-24"
                          value={editData.number || ""}
                          onChange={e => setEditData({ ...editData, number: e.target.value })}
                        />
                      ) : (
                        invoice.number
                      )}
                    </td>
                    <td className="p-3">
                      {editId === invoice.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-32"
                          value={editData.customer || ""}
                          onChange={e => setEditData({ ...editData, customer: e.target.value })}
                        />
                      ) : (
                        invoice.customer
                      )}
                    </td>
                    <td className="p-3">
                      {editId === invoice.id ? (
                        <input
                          type="date"
                          className="border rounded px-2 py-1 text-sm w-32"
                          value={editData.date || ""}
                          onChange={e => setEditData({ ...editData, date: e.target.value })}
                        />
                      ) : (
                        invoice.date ? new Date(invoice.date).toLocaleDateString() : ""
                      )}
                    </td>
                    <td className="p-3">
                      {editId === invoice.id ? (
                        <input
                          type="date"
                          className="border rounded px-2 py-1 text-sm w-32"
                          value={editData.dueDate || ""}
                          onChange={e => setEditData({ ...editData, dueDate: e.target.value })}
                        />
                      ) : (
                        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ""
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {editId === invoice.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-20"
                          value={editData.amount || ""}
                          onChange={e => setEditData({ ...editData, amount: e.target.value })}
                        />
                      ) : (
                        invoice.amount
                      )}
                    </td>
                    <td className="p-3">
                      {editId === invoice.id ? (
                        <select
                          className="border rounded px-2 py-1 text-sm w-20"
                          value={editData.status || "draft"}
                          onChange={e => setEditData({ ...editData, status: e.target.value })}
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="overdue">Overdue</option>
                          <option value="draft">Draft</option>
                        </select>
                      ) : (
                        <span className={`capitalize px-2 py-1 rounded text-xs font-medium border-0 ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex items-center gap-2 justify-center">
                      {editId === invoice.id ? (
                        <>
                          <button
                            className="text-green-600 hover:underline text-xs font-semibold"
                            onClick={handleSave}
                          >
                            Save
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
                            onClick={() => { setEditId(null); setEditData({}); }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEdit(invoice)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(invoice.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="text-[#005660] hover:text-gray-700"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-yellow-500 hover:text-yellow-700"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            title="Send"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Invoice Modal Popup */}
      <AddInvoiceModal open={showAddInvoice} onClose={() => setShowAddInvoice(false)} />
    </div>
  );
}

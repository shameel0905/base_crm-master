import { useState } from "react";
import { Download, MoreHorizontal, Trash2, Pencil } from "lucide-react";

const initialCustomers = [
  {
    id: "1",
    name: "Jordan",
    lastActive: "26 July 2025",
    dateRegistered: "26 July 2025",
    brand: "BBDAZZ",
    orders: 8,
    totalSpend: "$116.00",
    country: "USA",
    region: "New York"
  },
  {
    id: "2", 
    name: "Robinson",
    lastActive: "26 July 2025",
    dateRegistered: "26 July 2025",
    brand: "CWC",
    orders: 12,
    totalSpend: "$208.00",
    country: "USA",
    region: "New York"
  },
  {
    id: "3",
    name: "Warner",
    lastActive: "26 July 2025",
    dateRegistered: "26 July 2025", 
    brand: "CWC",
    orders: 1,
    totalSpend: "$45.00",
    country: "USA",
    region: "New York"
  },
  {
    id: "4",
    name: "Ellis",
    lastActive: "26 July 2025",
    dateRegistered: "26 July 2025",
    brand: "BBDAZZ", 
    orders: 5,
    totalSpend: "$96.00",
    country: "USA",
    region: "New York"
  }
];


export function CustomersTable() {
  const [filter, setFilter] = useState("All Customers");
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // Filter and search logic
  const filteredCustomers = customers.filter((customer) => {
    let matchesFilter = true;
    if (filter === "Active") matchesFilter = customer.orders > 5;
    if (filter === "Inactive") matchesFilter = customer.orders <= 5;
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.brand.toLowerCase().includes(search.toLowerCase()) ||
      customer.country.toLowerCase().includes(search.toLowerCase()) ||
      customer.region.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Delete customer
  const handleDelete = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Edit customer
  const handleEdit = (customer) => {
    setEditId(customer.id);
    setEditData(customer);
  };

  // Save edit
  const handleSave = () => {
    setCustomers((prev) => prev.map((c) => (c.id === editId ? editData : c)));
    setEditId(null);
    setEditData({});
  };

  // Add customer (demo: adds a blank row)
  const handleAdd = () => {
    const newCustomer = {
      id: Date.now().toString(),
      name: "",
      lastActive: "",
      dateRegistered: "",
      brand: "",
      orders: 0,
      totalSpend: "$0.00",
      country: "",
      region: ""
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setEditId(newCustomer.id);
    setEditData(newCustomer);
  };

  // Download customers as CSV
  const handleDownload = () => {
    const csvRows = [
      [
        "Name",
        "Last Active",
        "Date Registered",
        "Brand",
        "Orders",
        "Total Spend",
        "Country",
        "Region"
      ],
      ...customers.map(c => [
        c.name,
        c.lastActive,
        c.dateRegistered,
        c.brand,
        c.orders,
        c.totalSpend,
        c.country,
        c.region
      ])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-6 m-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Show :</span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-48 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="All Customers">All Customers</option>
            <option value="Active">Active Customers</option>
            <option value="Inactive">Inactive Customers</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white w-56"
          />
          <button
            className="bg-[#005660] hover:opacity-90 text-white px-4 py-2 rounded font-medium transition"
            onClick={handleAdd}
          >
            Add Customer
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Customers</h3>
          <div className="flex items-center space-x-2">
            <button className="flex items-center border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-100" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-black">
                <th className="p-3 text-left font-medium text-gray-100">Name</th>
                <th className="p-3 text-left font-medium text-gray-100">Last Active</th>
                <th className="p-3 text-left font-medium text-gray-100">Date Registered</th>
                <th className="p-3 text-left font-medium text-gray-100">Brand</th>
                <th className="p-3 text-left font-medium text-gray-100">Orders</th>
                <th className="p-3 text-left font-medium text-gray-100">Total Spend</th>
                <th className="p-3 text-left font-medium text-gray-100">Country</th>
                <th className="p-3 text-left font-medium text-gray-100">Region</th>
                <th className="p-3 text-center font-medium text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* Editable fields */}
                    <td className="p-3 font-medium">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-24"
                          value={editData.name || ""}
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        customer.name
                      )}
                    </td>
                    <td className="p-3">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-28"
                          value={editData.lastActive || ""}
                          onChange={e => setEditData({ ...editData, lastActive: e.target.value })}
                        />
                      ) : (
                        customer.lastActive
                      )}
                    </td>
                    <td className="p-3">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-28"
                          value={editData.dateRegistered || ""}
                          onChange={e => setEditData({ ...editData, dateRegistered: e.target.value })}
                        />
                      ) : (
                        customer.dateRegistered
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-20"
                          value={editData.brand || ""}
                          onChange={e => setEditData({ ...editData, brand: e.target.value })}
                        />
                      ) : (
                        customer.brand
                      )}
                    </td>
                    <td className="p-3">
                      {editId === customer.id ? (
                        <input
                          type="number"
                          className="border rounded px-2 py-1 text-sm w-12"
                          value={editData.orders || 0}
                          onChange={e => setEditData({ ...editData, orders: Number(e.target.value) })}
                        />
                      ) : (
                        <span className="px-2 py-1 bg-[#005660] rounded text-xs text-white font-medium">
                          {customer.orders.toString().padStart(2, '0')}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-16"
                          value={editData.totalSpend || ""}
                          onChange={e => setEditData({ ...editData, totalSpend: e.target.value })}
                        />
                      ) : (
                        customer.totalSpend
                      )}
                    </td>
                    <td className="p-3">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-16"
                          value={editData.country || ""}
                          onChange={e => setEditData({ ...editData, country: e.target.value })}
                        />
                      ) : (
                        customer.country
                      )}
                    </td>
                    <td className="p-3">
                      {editId === customer.id ? (
                        <input
                          className="border rounded px-2 py-1 text-sm w-16"
                          value={editData.region || ""}
                          onChange={e => setEditData({ ...editData, region: e.target.value })}
                        />
                      ) : (
                        customer.region
                      )}
                    </td>
                    {/* Actions */}
                    <td className="p-3 flex items-center gap-2 justify-center">
                      {editId === customer.id ? (
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
                            onClick={() => handleEdit(customer)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(customer.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

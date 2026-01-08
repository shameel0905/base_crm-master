import { useState, useRef, useEffect } from "react";

const initialFilters = [
  { name: "All", count: 42 },
  { name: "Unfulfilled", count: 12 },
  { name: "Unpaid", count: 7 },
  { name: "Open", count: 23 },
  { name: "Archived", count: 15 },
  { name: "Local Delivery", count: 9 },
];

function FilterTabs({ filters }) {
  const filterList = filters && filters.length > 0 ? filters : initialFilters;
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);
  const highlightRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const tab = tabRefs.current[activeTab];
      setHighlightStyle({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
      });
    }
  }, [activeTab, filterList]);

  return (
    <div className="relative w-full overflow-x-auto bg-black">
      <div className="flex gap-2 bg-black p-2 rounded-xl shadow-lg relative min-w-max">
        {/* Highlight background */}
        <span
          ref={highlightRef}
          className="absolute top-2 bottom-2 rounded-lg bg-gradient-to-r from-[#005660] to-[#005660] blur-md transition-all duration-300 z-0"
          style={{ left: highlightStyle.left, width: highlightStyle.width }}
        ></span>
        {filterList.map((filter, index) => (
          <button
            key={filter.name}
            ref={el => (tabRefs.current[index] = el)}
            onClick={() => setActiveTab(index)}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-300 z-10
              ${
                activeTab === index
                  ? "bg-gradient-to-r from-[#005660] to-[#005660] text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }
            `}
          >
            <span>{filter.name}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full transition-all duration-300 
                ${
                  activeTab === index
                    ? "bg-black/20 text-white"
                    : "bg-gray-700/60 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-200"
                }`}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const orders = [
  {
    id: "1008",
    date: "Today at 3:43 AM",
    customer: "No Customer",
    channel: "",
    total: "$80.00",
    status: "Paid"
  },
  {
    id: "997",
    date: "Today at 7:21 AM",
    customer: "Customer",
    channel: "",
    total: "$45.00",
    status: "Paid"
  },
  {
    id: "991",
    date: "Yesterday at 3:43 AM",
    customer: "Customer",
    channel: "",
    total: "$52.00",
    status: "Paid"
  },
  {
    id: "988",
    date: "Yesterday at 7:21 AM",
    customer: "No Customer",
    channel: "",
    total: "$25.00",
    status: "Paid"
  }
];

export function OrdersPage() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your orders and fulfillment</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <FilterTabs filters={initialFilters} />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <input
            placeholder="Search orders..."
            className="pl-4 pr-4 py-2.5 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660]"
          />
        </div>
        <div className="flex flex-1 space-x-2">
          <button className="flex items-center space-x-2 border border-gray-300 px-3 py-2.5 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm">
            <span>Status</span>
          </button>
          <button className="flex items-center space-x-2 border border-gray-300 px-3 py-2.5 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm">
            <span>Customer</span>
          </button>
          <button className="flex items-center space-x-2 border border-gray-300 px-3 py-2.5 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm">
            <span>Date</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
          <span className="font-medium">42</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-md border  bg-[#005660] text-sm font-medium text-white border-[#005660]">
            1
          </button>
          <button className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-12 p-4 text-left">
              <input type="checkbox" className="rounded border-gray-300 text-[#005660] focus:ring-[#005660]" />
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 border-b border-gray-100">
              <td className="p-4">
                <input type="checkbox" className="rounded border-gray-300 text-[#005660] focus:ring-[#005660]" />
              </td>
              <td className="p-4 font-medium text-gray-900">#{order.id}</td>
              <td className="p-4 text-gray-500">{order.date}</td>
              <td className="p-4 text-gray-500">{order.customer}</td>
              <td className="p-4 text-gray-500">{order.channel}</td>
              <td className="p-4 font-medium text-gray-900">{order.total}</td>
              <td className="p-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { FilterTabs };
export default OrdersPage;
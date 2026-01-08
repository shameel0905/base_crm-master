

import { useState, useRef, useEffect } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductList from "./ProductList";
import WooCommerceService from "../services/woocommerceService";

const initialFilters = [
  { name: "All", count: 0 },
  { name: "Unfulfilled", count: 0 },
  { name: "Unpaid", count: 0 },
  { name: "Open", count: 0 },
  { name: "Archived", count: 0 },
  { name: "Local Delivery", count: 0 },
];

function FilterTabs({ filters, activeTab, setActiveTab }) {
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
  }, [activeTab, filters]);

  return (
    <div className="relative w-full overflow-x-auto bg-black">
      <div className="flex gap-2 bg-black p-2 rounded-xl shadow-lg relative min-w-max">
        {/* Highlight background */}
        <span
          ref={highlightRef}
          className="absolute top-2 bottom-2 rounded-lg bg-gradient-to-r from-[#005660] to-[#005660] blur-md transition-all duration-300 z-0"
          style={{ left: highlightStyle.left, width: highlightStyle.width }}
        ></span>
        {filters.map((filter, index) => (
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

const allOrders = [
  {
    id: "1008",
    date: "Today at 3:43 AM",
    customer: "No Customer",
    channel: "Online Store",
    total: "$80.00",
    status: "Paid",
    fulfillment: "Unfulfilled",
    payment: "Paid",
    items: 3,
    deliveryStatus: "Pending",
    deliveryMethod: "Standard Shipping",
    tag: "Regular",
    products: [
      { id: 1, name: "Product 1", price: 29.99, image: "https://via.placeholder.com/80", quantity: 1 },
      { id: 2, name: "Product 2", price: 49.99, image: "https://via.placeholder.com/80", quantity: 2 },
    ]
  },
  {
    id: "997",
    date: "Today at 7:21 AM",
    customer: "John Doe",
    channel: "POS",
    total: "$45.00",
    status: "Unpaid",
    fulfillment: "Fulfilled",
    payment: "Unpaid",
    items: 1,
    deliveryStatus: "Processing",
    deliveryMethod: "In-Store Pickup",
    tag: "VIP",
    products: [
      { id: 3, name: "Product 3", price: 45.00, image: "https://via.placeholder.com/80", quantity: 1 },
    ]
  },
  {
    id: "991",
    date: "Yesterday at 3:43 AM",
    customer: "Jane Smith",
    channel: "Online Store",
    total: "$52.00",
    status: "Open",
    fulfillment: "Fulfilled",
    payment: "Paid",
    items: 2,
    deliveryStatus: "Shipped",
    deliveryMethod: "Express Shipping",
    tag: "New",
    products: [
      { id: 4, name: "Product 4", price: 30.00, image: "https://via.placeholder.com/80", quantity: 1 },
      { id: 5, name: "Product 5", price: 22.00, image: "https://via.placeholder.com/80", quantity: 1 },
    ]
  },
  {
    id: "988",
    date: "Yesterday at 7:21 AM",
    customer: "No Customer",
    channel: "Local Delivery",
    total: "$25.00",
    status: "Archived",
    fulfillment: "Fulfilled",
    payment: "Paid",
    items: 1,
    deliveryStatus: "Delivered",
    deliveryMethod: "Local Courier",
    tag: "Sale",
    products: [
      { id: 6, name: "Product 6", price: 25.00, image: "https://via.placeholder.com/80", quantity: 1 },
    ]
  },
  {
    id: "985",
    date: "2 days ago at 2:15 PM",
    customer: "Mike Johnson",
    channel: "Online Store",
    total: "$120.00",
    status: "Paid",
    fulfillment: "Unfulfilled",
    payment: "Paid",
    items: 5,
    deliveryStatus: "Pending",
    deliveryMethod: "Standard Shipping",
    tag: "Bulk",
    products: [
      { id: 7, name: "Product 7", price: 24.00, image: "https://via.placeholder.com/80", quantity: 5 },
    ]
  },
  {
    id: "982",
    date: "2 days ago at 5:30 PM",
    customer: "Sarah Wilson",
    channel: "Local Delivery",
    total: "$65.00",
    status: "Open",
    fulfillment: "Fulfilled",
    payment: "Paid",
    items: 2,
    deliveryStatus: "Out for Delivery",
    deliveryMethod: "Local Delivery",
    tag: "Regular",
    products: [
      { id: 8, name: "Product 8", price: 32.50, image: "https://via.placeholder.com/80", quantity: 2 },
    ]
  }
];

// Transform WooCommerce order data to our format (according to Order.md specification)
const transformWooCommerceOrder = (wooOrder) => {
  // MAPPING ACCORDING TO ORDER.MD API SPECIFICATION
  
  // 1. Extract core order properties (per Order properties table)
  const orderId = wooOrder.id; // integer: Unique identifier
  const orderNumber = wooOrder.number; // string: Order number (read-only)
  const status = wooOrder.status; // string: pending, processing, on-hold, completed, cancelled, refunded, failed, trash
  const currency = wooOrder.currency; // string: ISO format (USD, EUR, etc.)
  const dateCreated = new Date(wooOrder.date_created); // date-time: Order creation date
  const dateModified = new Date(wooOrder.date_modified); // date-time: Last modification date
  const datePaid = wooOrder.date_paid ? new Date(wooOrder.date_paid) : null; // date-time: Payment date
  const dateCompleted = wooOrder.date_completed ? new Date(wooOrder.date_completed) : null; // date-time: Completion date

  // 2. Extract billing information (per Order - Billing properties)
  const billing = wooOrder.billing || {};
  const billingFirstName = billing.first_name || "";
  const billingLastName = billing.last_name || "";
  const billingCompany = billing.company || "";
  const billingEmail = billing.email || "";
  const billingPhone = billing.phone || "";
  const billingCity = billing.city || "";
  const billingState = billing.state || "";
  const billingCountry = billing.country || "";

  // 3. Extract shipping information (per Order - Shipping properties)
  const shipping = wooOrder.shipping || {};
  const shippingFirstName = shipping.first_name || "";
  const shippingLastName = shipping.last_name || "";
  const shippingCity = shipping.city || "";
  const shippingState = shipping.state || "";
  const shippingCountry = shipping.country || "";

  // 4. Extract line items (per Order - Line items properties)
  const lineItems = wooOrder.line_items || [];
  const products = lineItems.map((item) => ({
    id: item.id, // integer: Item ID (read-only)
    productId: item.product_id, // integer: Product ID
    variationId: item.variation_id, // integer: Variation ID if applicable
    name: item.name, // string: Product name
    quantity: item.quantity, // integer: Quantity ordered
    sku: item.sku, // string: Product SKU (read-only)
    price: parseFloat(item.price), // string: Product price (read-only)
    subtotal: parseFloat(item.subtotal), // string: Line subtotal before discounts
    total: parseFloat(item.total), // string: Line total after discounts
    subtotalTax: parseFloat(item.subtotal_tax), // string: Line subtotal tax (read-only)
    totalTax: parseFloat(item.total_tax), // string: Line total tax (read-only)
    image: "https://via.placeholder.com/80",
  }));

  // 5. Extract shipping lines (per Order - Shipping lines properties)
  const shippingLines = wooOrder.shipping_lines || [];
  const primaryShippingLine = shippingLines[0] || {};
  const shippingMethodTitle = primaryShippingLine.method_title || "Standard Shipping"; // string: Shipping method name
  const shippingMethodId = primaryShippingLine.method_id || "standard"; // string: Shipping method ID
  const shippingTotal = parseFloat(wooOrder.shipping_total || 0); // string: Total shipping amount

  // 6. Extract financial totals (per Order properties)
  const discountTotal = parseFloat(wooOrder.discount_total || 0); // string: Total discount amount (read-only)
  const cartTax = parseFloat(wooOrder.cart_tax || 0); // string: Sum of line item taxes (read-only)
  const totalTax = parseFloat(wooOrder.total_tax || 0); // string: Sum of all taxes (read-only)
  const total = parseFloat(wooOrder.total || 0); // string: Grand total (read-only)

  // 7. Extract payment information (per Order properties)
  const paymentMethod = wooOrder.payment_method || ""; // string: Payment method ID
  const paymentMethodTitle = wooOrder.payment_method_title || ""; // string: Payment method title
  const transactionId = wooOrder.transaction_id || ""; // string: Unique transaction ID
  const customerId = wooOrder.customer_id || 0; // integer: User ID who owns order (0 for guests)

  // 8. Extract metadata and other properties
  const metaData = wooOrder.meta_data || []; // array: Meta data
  const couponLines = wooOrder.coupon_lines || []; // array: Coupons line data
  const refunds = wooOrder.refunds || []; // array: List of refunds (read-only)
  const customerNote = wooOrder.customer_note || ""; // string: Note left by customer during checkout

  // ========== TRANSFORMATION TO COMPONENT FORMAT ==========

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return str;
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Determine customer name from billing info
  const customerName = billingFirstName && billingLastName 
    ? capitalizeWords(`${billingFirstName} ${billingLastName}`)
    : (billingCompany ? capitalizeWords(billingCompany) : "No Customer");

  // Determine payment status based on date_paid
  const paymentStatus = datePaid ? "Paid" : "Unpaid"; // From Order - date_paid

  // Determine fulfillment status based on order status
  let fulfillmentStatus = "Unfulfilled";
  if (status === "completed") {
    fulfillmentStatus = "Fulfilled";
  } else if (status === "cancelled" || status === "refunded") {
    fulfillmentStatus = "Cancelled";
  } else if (status === "processing" || status === "on-hold") {
    fulfillmentStatus = "Processing";
  }

  // Determine delivery status based on order status
  let deliveryStatus = "Pending";
  if (status === "completed") {
    deliveryStatus = "Delivered";
  } else if (status === "processing") {
    deliveryStatus = "Processing";
  } else if (status === "on-hold") {
    deliveryStatus = "Out for Delivery";
  } else if (status === "cancelled" || status === "refunded") {
    deliveryStatus = "Cancelled";
  }

  // Determine channel from shipping method
  const channel = shippingMethodId === "local_pickup" ? "Local Delivery" : "Online Store";

  // Format date for display
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let formattedDate = dateCreated.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
  });

  if (dateCreated.toDateString() === today.toDateString()) {
    formattedDate = `Today at ${formattedDate}`;
  } else if (dateCreated.toDateString() === yesterday.toDateString()) {
    formattedDate = `Yesterday at ${formattedDate}`;
  } else {
    formattedDate = `${dateCreated.toLocaleDateString('en-US')} at ${formattedDate}`;
  }

  // Determine tag based on order status
  let tag = "Regular";
  if (status === "completed") {
    tag = "Completed";
  } else if (status === "on-hold") {
    tag = "On Hold";
  } else if (status === "cancelled" || status === "refunded") {
    tag = "Cancelled";
  } else if (customerId === 0) {
    tag = "Guest";
  }

  // Return transformed order object matching component expectations
  return {
    // Table display fields
    id: orderId.toString(),
    number: orderNumber, // From Order.number
    date: formattedDate,
    customer: customerName,
    channel: channel,
    total: `${currency} ${total.toFixed(2)}`,
    status: status, // pending, processing, on-hold, completed, cancelled, refunded, failed, trash
    fulfillment: fulfillmentStatus,
    paymentStatus: paymentStatus, // Renamed from 'payment' to avoid conflicts
    items: products.length,
    deliveryStatus: deliveryStatus,
    deliveryMethod: shippingMethodTitle,
    tag: tag,

    // Detailed information
    products: products,
    
    // Financial details
    subtotal: products.reduce((sum, p) => sum + p.subtotal, 0),
    discountTotal: discountTotal,
    shippingTotal: shippingTotal,
    cartTax: cartTax,
    totalTax: totalTax,
    totalAmount: total, // Renamed from 'total' to avoid conflicts with totalAmount
    currency: currency,

    // Customer information (per Order - Billing properties)
    billing: {
      firstName: billingFirstName,
      lastName: billingLastName,
      company: billingCompany,
      email: billingEmail,
      phone: billingPhone,
      city: billingCity,
      state: billingState,
      country: billingCountry,
    },

    // Shipping information (per Order - Shipping properties)
    shipping: {
      firstName: shippingFirstName,
      lastName: shippingLastName,
      city: shippingCity,
      state: shippingState,
      country: shippingCountry,
    },

    // Payment information (per Order properties)
    paymentInfo: {
      method: paymentMethod, // payment_method
      methodTitle: paymentMethodTitle, // payment_method_title
      transactionId: transactionId, // transaction_id
      datePaid: datePaid, // date_paid
    },

    // Order metadata (per Order properties)
    customerId: customerId,
    customerNote: customerNote,
    couponLines: couponLines,
    refunds: refunds,
    metaData: metaData,
    createdAt: dateCreated,
    modifiedAt: dateModified,
    completedAt: dateCompleted,

    // Original WooCommerce data for reference
    wooOrder: wooOrder,
  };
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterCounts, setFilterCounts] = useState(initialFilters);
  const pageSize = 10; // Number of orders per page
  const navigate = useNavigate();

  // Fetch orders from WooCommerce API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await WooCommerceService.getAllOrders({ 
          page: 1, 
          per_page: 100 
        });
        
        if (response.success) {
          const transformedOrders = response.orders.map(transformWooCommerceOrder);
          setOrders(transformedOrders);
          
      // Update filter counts
          const counts = [...initialFilters];
          counts[0].count = transformedOrders.length; // All
          counts[1].count = transformedOrders.filter(o => o.fulfillment === "Unfulfilled").length; // Unfulfilled
          counts[2].count = transformedOrders.filter(o => o.paymentStatus === "Unpaid").length; // Unpaid
          counts[3].count = transformedOrders.filter(o => o.status === "open").length; // Open
          counts[4].count = transformedOrders.filter(o => o.status === "cancelled").length; // Archived
          counts[5].count = transformedOrders.filter(o => o.channel === "Local Delivery").length; // Local Delivery
          setFilterCounts(counts);
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders from server");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on active tab and search term
  const filteredOrders = orders.filter(order => {
    const filterName = initialFilters[activeTab].name;
    // If 'All' tab, show all orders (with search and status filter)
    let matchesTab = true;
    if (filterName !== "All") {
      if (filterName === "Unfulfilled") {
        matchesTab = order.fulfillment === "Unfulfilled";
      } else if (filterName === "Unpaid") {
        matchesTab = order.payment === "Unpaid";
      } else if (filterName === "Open") {
        matchesTab = order.status === "Open";
      } else if (filterName === "Archived") {
        matchesTab = order.status === "Archived";
      } else if (filterName === "Local Delivery") {
        matchesTab = order.channel === "Local Delivery";
      }
    }
    // Apply search filter
    const matchesSearch = searchTerm === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.total.toLowerCase().includes(searchTerm.toLowerCase());
    // Apply status filter
    const matchesStatus = statusFilter === "All" || order.status === statusFilter || order.paymentStatus === statusFilter || order.fulfillment === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalOrders);
  const paginatedOrders = filteredOrders.slice(startIdx, endIdx);

  // Reset to first page if filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005660]"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#005660] text-white px-4 py-2 rounded-lg hover:bg-[#00444d]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 px-4">
      {/* Filter Tabs + Search/Filters */}
      <div className="mb-6 bg-black rounded-xl p-4">
        <div className="space-y-3">
          {/* Filter Tabs */}
          <div className="overflow-x-auto">
            <FilterTabs 
              filters={filterCounts} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          
          {/* Search and Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 pl-4 pr-4 py-2.5 rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660] placeholder-gray-400 text-sm"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660]"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Unfulfilled">Unfulfilled</option>
            </select>
            <button className="border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm whitespace-nowrap">
              Customer
            </button>
            <button className="border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm whitespace-nowrap">
              Date
            </button>
            <button
              className="bg-[#005660] text-white px-4 py-2.5 rounded-lg hover:bg-[#00444d] transition text-sm whitespace-nowrap font-medium"
              onClick={() => navigate('/add-order')}
            >
              + Add Order
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={paginatedOrders} setOrders={setOrders} onSelectOrder={setSelectedOrder} />

      {/* ProductList for selected order */}
      {selectedOrder && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Products for Order #{selectedOrder.id}</h2>
          <ProductList products={selectedOrder.products} readOnly />
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-gray-700">
          {totalOrders === 0 ? (
            <>No results</>
          ) : (
            <>
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{endIdx}</span> of{' '}
              <span className="font-medium">{totalOrders}</span> results
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-[#005660] text-white border-[#005660]"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalOrders === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersTable({ orders, setOrders, onSelectOrder }) {
  const getDeliveryStatusColor = (status) => {
    switch(status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Out for Delivery": return "bg-purple-100 text-purple-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTagColor = (tag) => {
    switch(tag) {
      case "VIP": return "bg-purple-100 text-purple-800";
      case "New": return "bg-blue-100 text-blue-800";
      case "Sale": return "bg-red-100 text-red-800";
      case "Bulk": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const navigate = useNavigate();
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };
  const handleEdit = (order) => {
    navigate("/add-order", { state: { order } });
  };
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
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Status</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Method</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 border-b border-gray-100">
              <td className="p-4">
                <input type="checkbox" className="rounded border-gray-300 text-[#005660] focus:ring-[#005660]" />
              </td>
              <td className="p-4 font-medium text-gray-900">
                <button onClick={() => onSelectOrder && onSelectOrder(order)} className="text-[#005660] underline">
                  #{order.id}
                </button>
              </td>
              <td className="p-4 text-gray-500">{order.date}</td>
              <td className="p-4 text-gray-500">{order.customer}</td>
              <td className="p-4 text-gray-500">{order.channel}</td>
              <td className="p-4 text-gray-500">
                {((orders.indexOf(order) % 2) === 0 ? 'CWC' : 'BDDAZZ')}
              </td>
              <td className="p-4 text-gray-500">{order.items}</td>
              <td className="p-4 font-medium text-gray-900">
                ${
                  order.products && order.products.length > 0
                    ? order.products.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity ?? 1), 0).toFixed(2)
                    : order.total
                }
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  order.paymentStatus === "Paid" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {order.paymentStatus}
                </span>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                  {order.deliveryStatus}
                </span>
              </td>
              <td className="p-4 text-gray-500">{order.deliveryMethod}</td>
              <td className="p-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTagColor(order.tag)}`}>
                  {order.tag}
                </span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleEdit(order)}
                  className="text-blue-500 hover:bg-blue-50 rounded-full p-2 transition mr-2"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-red-500 hover:bg-red-50 rounded-full p-2 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="13" className="p-8 text-center text-gray-500">
                No orders found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { FilterTabs };
export default OrdersPage;
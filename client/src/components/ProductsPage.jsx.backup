import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { Trash2, Pencil } from "lucide-react";

// Helper: trigger browser download
function downloadBlob(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportProductsToJSON(products) {
  const filename = `products_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  downloadBlob(filename, JSON.stringify(products, null, 2), 'application/json');
}

function exportProductsToCSV(products) {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }
  const headers = Object.keys(products[0]).filter(k => k !== 'image');
  const rows = [headers.join(',')];
  for (const p of products) {
    const vals = headers.map(h => {
      const v = p[h] == null ? '' : String(p[h]);
      if (v.includes(',') || v.includes('\n') || v.includes('"')) {
        return '"' + v.replace(/"/g, '""') + '"';
      }
      return v;
    });
    rows.push(vals.join(','));
  }
  const csv = rows.join('\n');
  const filename = `products_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
  downloadBlob(filename, csv, 'text/csv');
}

// CSV helpers for platform-specific exports
function escapeCsvCell(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function parseInventoryQuantity(inv, fallbackQuantity) {
  if (inv == null) return fallbackQuantity != null ? fallbackQuantity : '';
  const m = String(inv).match(/(\d+)/);
  if (m) return parseInt(m[1], 10);
  return fallbackQuantity != null ? fallbackQuantity : '';
}

function exportToShopifyCSV(products) {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }
  const headers = [
    'Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Variant SKU','Variant Grams','Variant Inventory Qty','Variant Inventory Policy','Variant Price','Image Src'
  ];
  const rows = [headers.join(',')];

  for (const p of products) {
    const handle = (p.name || `product-${p.id}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const title = p.name || '';
    const body = p.body_html || '';
    const vendor = p.vendor || '';
    const type = p.category || p.type || '';
    const published = p.status && p.status.toLowerCase() === 'active' ? 'TRUE' : 'FALSE';
    const sku = p.sku || `P-${p.id}`;
    const inventoryQty = parseInventoryQuantity(p.inventory, p.quantity);
    const inventoryPolicy = (p.inventory_policy) || (inventoryQty === '' || inventoryQty === 0 ? 'continue' : 'deny');
    const price = p.price ? String(p.price).replace(/[^0-9.]/g, '') : '';
    const imageSrc = p.image || '';

    const row = [
      escapeCsvCell(handle),
      escapeCsvCell(title),
      escapeCsvCell(body),
      escapeCsvCell(vendor),
      escapeCsvCell(type),
      '',
      published,
      'Title',
      '',
      escapeCsvCell(sku),
      '',
      inventoryQty !== '' ? String(inventoryQty) : '',
      escapeCsvCell(inventoryPolicy),
      price,
      escapeCsvCell(imageSrc),
    ];
    rows.push(row.join(','));
  }

  const csv = rows.join('\n');
  const filename = `shopify_products_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
  downloadBlob(filename, csv, 'text/csv');
}

function exportToWooCSV(products) {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }
  const headers = [
    'ID','Type','SKU','Name','Published','Is featured?','Visibility in catalog','Short description','Description','Tax status','In stock?','Stock','Backorders allowed?','Sold individually?','Regular price','Categories','Tags','Shipping class','Images'
  ];
  const rows = [headers.join(',')];

  for (const p of products) {
    const id = p.id != null ? String(p.id) : '';
    const name = p.name || '';
    const sku = p.sku || `P-${p.id}`;
    const published = p.status && p.status.toLowerCase() === 'active' ? '1' : '0';
    const stock = parseInventoryQuantity(p.inventory, p.quantity);
    const inStock = stock > 0 ? '1' : '0';
    const price = p.price ? String(p.price).replace(/[^0-9.]/g, '') : '';
    const images = p.image || '';
    const categories = p.category || p.type || '';
    const desc = p.body_html || '';

    const row = [
      escapeCsvCell(id),
      'simple',
      escapeCsvCell(sku),
      escapeCsvCell(name),
      published,
      '0',
      'visible',
      '',
      escapeCsvCell(desc),
      'taxable',
      inStock,
      stock !== '' ? String(stock) : '',
      'no',
      'no',
      price,
      escapeCsvCell(categories),
      '',
      '',
      escapeCsvCell(images),
    ];
    rows.push(row.join(','));
  }

  const csv = rows.join('\n');
  const filename = `woocommerce_products_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
  downloadBlob(filename, csv, 'text/csv');
}

const initialFilters = [
  { name: "All", count: 12 },
  { name: "Active", count: 8 },
  { name: "Draft", count: 3 },
  { name: "Archived", count: 1 },
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




export function ProductsPage() {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of products per page

  // Get unique vendors for filter dropdown
  const vendors = ["All", ...new Set(products.map(product => product.vendor))];

  // Filter products based on active tab and search term
  const filteredProducts = products.filter(product => {
    const filterName = initialFilters[activeTab].name;
    // Apply tab filter
    let matchesTab = true;
    if (filterName === "Active") {
      matchesTab = product.status === "Active";
    } else if (filterName === "Draft") {
      matchesTab = product.status === "Draft";
    } else if (filterName === "Archived") {
      matchesTab = product.status === "Archived";
    }
    // Apply search filter
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toLowerCase().includes(searchTerm.toLowerCase());
    // Apply status filter
    const matchesStatus = statusFilter === "All" || product.status === statusFilter;
    // Apply vendor filter
    const matchesVendor = vendorFilter === "All" || product.vendor === vendorFilter;
    
    return matchesTab && matchesSearch && matchesStatus && matchesVendor;
  });

  // Pagination logic
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

  // Reset to first page if filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter, vendorFilter]);

  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-auto bg-gray-50 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"
            onClick={() => exportProductsToJSON(products)}
            title="Download products as JSON"
          >
            Export JSON
          </button>
          <button
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"
            onClick={() => exportProductsToCSV(products)}
            title="Download products as CSV (flat)"
          >
            Export CSV
          </button>
          <button
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"
            onClick={() => exportToShopifyCSV(products)}
            title="Download Shopify CSV for full catalog"
          >
            Export Shopify CSV
          </button>
          <button
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"
            onClick={() => exportToWooCSV(products)}
            title="Download WooCommerce CSV for full catalog"
          >
            Export Woo CSV
          </button>
          <button
            className="bg-[#005660] text-white px-4 py-2.5 rounded-lg hover:bg-[#00444d] transition flex items-center space-x-2"
            onClick={() => navigate('/add-product')}
          >
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs + Search/Filters */}
      <div className="mb-6 bg-black rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <FilterTabs 
              filters={initialFilters} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          <div className="flex flex-1 gap-2">
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2.5 w-full rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660] placeholder-gray-400"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <select 
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-[#005660]"
            >
              {vendors.map(vendor => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
            <button className="flex items-center space-x-2 border border-gray-700 px-3 py-2.5 rounded-lg text-white bg-black hover:bg-gray-900 text-sm">
              <span>Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable products={paginatedProducts} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-gray-700">
          {totalProducts === 0 ? (
            <>No results</>
          ) : (
            <>
              Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{endIdx}</span> of{' '}
              <span className="font-medium">{totalProducts}</span> results
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
            disabled={currentPage === totalPages || totalProducts === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsTable({ products }) {
  const { setProducts } = useProducts();
  const navigate = useNavigate();
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };
  const handleEdit = (product) => {
    // For now, just navigate to add-product with state (future: implement edit mode)
    navigate("/add-product", { state: { product } });
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-12 p-4 text-left">
              <input type="checkbox" className="rounded border-gray-300 text-[#005660] focus:ring-[#005660]" />
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50/50 border-b border-gray-100">
              <td className="p-4">
                <input type="checkbox" className="rounded border-gray-300 text-[#005660] focus:ring-[#005660]" />
              </td>
              <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                />
                {product.name}
              </td>
              <td className="p-4 text-gray-500">{product.category}</td>
              <td className="p-4 text-gray-500">{product.vendor}</td>
              <td className="p-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  product.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : product.status === "Draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {product.status}
                </span>
              </td>
              <td className="p-4 text-gray-500">{product.inventory}</td>
              <td className="p-4 text-gray-500">{product.type}</td>
              <td className="p-4 font-medium text-gray-900">{product.price}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-500 hover:bg-blue-50 rounded-full p-2 transition mr-2"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 hover:bg-red-50 rounded-full p-2 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="10" className="p-8 text-center text-gray-500">
                No products found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { FilterTabs };
export default ProductsPage;
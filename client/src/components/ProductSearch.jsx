import { useState } from "react";
import { Search, X } from "lucide-react";

export default function ProductSearch() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#005660] focus:outline-none text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          Filters
        </button>
        <button className="px-3 py-2 text-sm rounded-lg bg-[#005660] text-white hover:bg-[#00424a]">
          + Custom Item
        </button>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <label className="text-gray-500">Category</label>
            <select className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#005660] focus:outline-none">
              <option>All</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Accessories</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500">Price Range</label>
            <input
              type="text"
              placeholder="e.g. 10-100"
              className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#005660] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500">Availability</label>
            <select className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#005660] focus:outline-none">
              <option>All</option>
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500">Brand</label>
            <select className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#005660] focus:outline-none">
              <option>All</option>
              <option>Apple</option>
              <option>Nike</option>
              <option>Samsung</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Status */}
      {search && (
        <p className="text-sm text-gray-500">
          Showing results for: <span className="font-medium">{search}</span>
        </p>
      )}
    </div>
  );
}

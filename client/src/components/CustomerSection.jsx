import { Search, ChevronDown, Users, Filter } from "lucide-react";
import { useState } from "react";

export function CustomerSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("cwc");

  const brands = [
    { id: "cwc", name: "CWC", customers: 254 },
    { id: "bbdazz", name: "BBDAZZ", customers: 128 },
    // { id: "brand2", name: "Brand 2", customers: 76 }
  ];

  // const handleAddNewCustomer = () => {
  //   alert("Add new customer functionality would open here");
  // };

  return (
    <>
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#005660]" />
          Customers
        </h3>
        {/* actions could go here (e.g. New Customer) */}
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 bg-gray-50 border border-gray-300 h-10 w-full rounded-md focus:ring-1 focus:ring-[#005660] focus:border-[#005660] text-sm"
            type="text"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
          <Filter className="h-4 w-4" />
          Select Brand
        </label>
        <div className="relative">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full h-10 bg-gray-50 border border-gray-300 rounded-md pr-8 pl-3 text-sm text-gray-700 focus:ring-1 focus:ring-[#005660] focus:border-[#005660] cursor-pointer"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.customers})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Search Status */}
      {searchTerm && (
        <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 p-3 rounded-md">
          Searching for "{searchTerm}" in {brands.find(b => b.id === selectedBrand)?.name}...
        </div>
      )}
    </div>
    </>
  );
}

import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Layers3,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Tags
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const NavItem = ({ icon, label, to, isActive = false, onClick, hasDropdown = false, isOpen = false }) => {
  const inner = (
    <div 
      className={`
        flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group
        ${isActive 
          ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm border border-white/10' 
          : 'text-gray-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
        }
      `}
      // Only attach onClick for dropdown toggles or if a custom click handler is provided
      onClick={hasDropdown ? onClick : undefined}
    >
      <div className={`w-5 h-5 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`font-medium text-sm flex-1 ${isActive ? 'font-semibold' : ''}`}>
        {label}
      </span>
      {hasDropdown && (
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      )}
      {isActive && !hasDropdown && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
      )}
    </div>
  );

  // If `to` is provided and this is not a dropdown, wrap the inner content with Link so it navigates.
  if (to && !hasDropdown) {
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
};

const DropdownItem = ({ icon, label, to, isActive = false }) => (
  <Link to={to} className="block">
    <div 
      className={`
        flex items-center gap-4 px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group ml-4
        ${isActive 
          ? 'bg-white/10 text-white border-l-2 border-white' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
        }
      `}
    >
      <div className="w-4 h-4">
        {icon}
      </div>
      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
        {label}
      </span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
      )}
    </div>
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();
  const [isProductsOpen, setIsProductsOpen] = useState(
    location.pathname === "/add-product" ||
    location.pathname === "/category" ||
    location.pathname.startsWith("/edit-product/") ||
    location.pathname.startsWith("/category/")
  );

  const [isOrdersOpen, setIsOrdersOpen] = useState(
    location.pathname === "/add-order" ||
    location.pathname.startsWith("/edit-order/")
  );

  // Check if any product-related route is active
  const isProductsActive = 
    location.pathname === "/products" || 
    location.pathname === "/category" ||
    location.pathname === "/add-product" ||
    location.pathname.startsWith("/products/") ||
    location.pathname.startsWith("/category/") ||
    location.pathname.startsWith("/edit-product/");

  // Check if any order-related route is active
  const isOrdersActive = 
    location.pathname === "/orders" || 
    location.pathname === "/add-order" ||
    location.pathname.startsWith("/edit-order/");

  return (
    <div className="w-64 min-h-screen h-full fixed top-0 left-0 z-30 flex flex-col border-r border-gray-700/50 shadow-2xl bg-gradient-to-br from-[#000000] via-[#002830] to-[#005660] text-white">
      {/* Logo */}
      <div className="p-8 border-b border-white/10 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#005660] to-[#00a0b0] rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-xl font-black">B</span>
          </div>
          BASE
        </h1>
        <p className="text-xs text-gray-400 mt-2 ml-12">CRM Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden"
        style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: '#005660 transparent',
          minHeight: 0
        }}
      >
        <NavItem 
          icon={<LayoutDashboard />} 
          label="Dashboards" 
          to="/dashboard"
          isActive={location.pathname === "/dashboard"}
        />
        
        {/* Orders Dropdown */}
        <div className="space-y-1">
          <NavItem 
            icon={<Layers3 />} 
            label="Orders" 
            to="/orders"
            isActive={isOrdersActive}
            hasDropdown={true}
            isOpen={isOrdersOpen}
            onClick={() => setIsOrdersOpen(!isOrdersOpen)}
          />
          
          {isOrdersOpen && (
            <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
              <DropdownItem 
                icon={<Layers3 className="w-4 h-4" />}
                label="All Orders" 
                to="/orders"
                isActive={location.pathname === "/orders"}
              />
              <DropdownItem 
                icon={<Layers3 className="w-4 h-4" />}
                label="Add Order" 
                to="/add-order"
                isActive={location.pathname === "/add-order" || location.pathname.startsWith("/edit-order/")}
              />
            </div>
          )}
        </div>

        {/* Products Dropdown */}
        <div className="space-y-1">
          <NavItem 
            icon={<Package />} 
            label="Products" 
            to="/products"
            isActive={isProductsActive}
            hasDropdown={true}
            isOpen={isProductsOpen}
            onClick={() => setIsProductsOpen(!isProductsOpen)}
          />
          
          {isProductsOpen && (
            <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
              <DropdownItem 
                icon={<Package className="w-4 h-4" />}
                label="All Products" 
                to="/products"
                isActive={location.pathname === "/products"}
              />
              <DropdownItem 
                icon={<Package className="w-4 h-4" />}
                label="Add Product" 
                to="/add-product"
                isActive={location.pathname === "/add-product" || location.pathname.startsWith("/edit-product/")}
              />
              <DropdownItem 
                icon={<FolderOpen className="w-4 h-4" />}
                label="Category" 
                to="/category"
                isActive={location.pathname === "/category" || location.pathname.startsWith("/category/")}
              />
              {/* <DropdownItem 
                icon={<Tags className="w-4 h-4" />}
                label="Tags" 
                to="/tags"
                isActive={location.pathname === "/tags" || location.pathname.startsWith("/tags/")}
              />
              <DropdownItem 
                icon={<Package className="w-4 h-4" />}
                label="Inventory" 
                to="/inventory"
                isActive={location.pathname === "/inventory" || location.pathname.startsWith("/inventory/")}
              /> */}
            </div>
          )}
        </div>

        <NavItem 
          icon={<Users />} 
          label="Customers" 
          to="/customers"
          isActive={location.pathname === "/customers"}
        />
        
        <NavItem 
          icon={<FileText />} 
          label="Invoice" 
          to="/invoice"
          isActive={location.pathname === "/invoice"}
        />
        
        <NavItem 
          icon={<Settings />} 
          label="Setting" 
          to="/settings"
          isActive={location.pathname === "/settings"}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex-shrink-0 mt-auto">
        <div className="px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm">
          <p className="text-xs text-gray-400">Version 1.0.0</p>
          <p className="text-xs text-gray-500 mt-0.5">© 2025 BASE CRM</p>
        </div>
      </div>
    </div>
  );
};
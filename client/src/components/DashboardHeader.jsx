import tracksuitImg from "../assets/images/tracksuit.png";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Layers3, 
  Package, 
  Folder, 
  Users, 
  FileText, 
  Settings,
  Plus,
  Edit3
} from "lucide-react";

export const DashboardHeader = ({ title = "Dashboard" }) => {
  const location = useLocation();

  // Dynamic title and icon based on current route
  const getTitleAndIcon = () => {
    const pathname = location.pathname;
    
    if (pathname === "/dashboard") return { title: "Dashboard", icon: LayoutDashboard, subtitle: "Overview" };
    if (pathname === "/orders") return { title: "Order Inventory", icon: Layers3, subtitle: "Management" };
    if (pathname === "/add-order") return { title: "Create New Order", icon: Plus, subtitle: "Add Order" };
    if (pathname.startsWith("/edit-order/")) return { title: "Edit Order", icon: Edit3, subtitle: "Update Order" };
    if (pathname === "/products") return { title: "Product Inventory", icon: Package, subtitle: "Management" };
    if (pathname === "/add-product") return { title: "Create New Product", icon: Plus, subtitle: "Add Product" };
    if (pathname.startsWith("/edit-product/")) return { title: "Edit Product", icon: Edit3, subtitle: "Update Product" };
    if (pathname === "/category") return { title: "Product Categories", icon: Folder, subtitle: "Management" };
    if (pathname.startsWith("/category/")) return { title: "Product Categories", icon: Folder, subtitle: "Management" };
    if (pathname === "/customers") return { title: "Customer Directory", icon: Users, subtitle: "Management" };
    if (pathname === "/invoice") return { title: "Invoice Manager", icon: FileText, subtitle: "Management" };
    if (pathname === "/settings") return { title: "Settings", icon: Settings, subtitle: "Configuration" };
    
    return { title, icon: LayoutDashboard, subtitle: "Page" };
  };

  const { title: pageTitle, icon: TitleIcon, subtitle: titleSubtitle } = getTitleAndIcon();
  
  // Get subtitle based on page
  const getSubtitle = () => {
    const pathname = location.pathname;
    if (pathname === "/orders" || pathname === "/add-order" || pathname.startsWith("/edit-order/")) {
      return "Manage your orders efficiently";
    }
    if (pathname === "/products" || pathname === "/add-product" || pathname.startsWith("/edit-product/")) {
      return "Manage your product catalog";
    }
    if (pathname === "/customers") {
      return "Manage customer information";
    }
    if (pathname === "/invoice") {
      return "View and manage invoices";
    }
    if (pathname === "/settings") {
      return "Configure your settings";
    }
    if (pathname === "/category" || pathname.startsWith("/category/")) {
      return "Organize your products by category";
    }
    if (pathname === "/dashboard") {
      return "Welcome back! Here's your business overview";
    }
    return "You have got 24 new sales.";
  };

  return (
    <header className="bg-[#f5f5f5] shadow-sm border border-gray-300 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-4 sm:px-6 py-4 gap-4 sm:gap-0">
      {/* Left Side */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 bg-[#005660] rounded-lg flex items-center justify-center mt-1">
          <TitleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--theme-color)] mb-0">{pageTitle}</h1>
            <span className="text-xs sm:text-sm px-2.5 py-1 bg-[#005660]/10 text-[#005660] font-medium rounded-full">{titleSubtitle}</span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{getSubtitle()}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 self-end sm:self-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-800">CWC</span>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
          <img
            src={tracksuitImg}
            alt="User Icon"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </header>
  );
};

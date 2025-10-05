import React from 'react'; 
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../services/auth';
import { 
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Tag,
  Package,
  Circle, // Used as a default icon for sub-items without specific icons
  X, // Close icon for mobile
} from 'lucide-react';

// --- UI Data --- 
const navItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    level: 0,
  },
  {
    // Consolidated the sub-items into a single primary link
    name: 'Products Management', 
    icon: Shirt,
    path: '/admin/product-management', // Updated to match routing structure
    level: 0,
    // SubItems have been removed completely
  },
  {
    name: 'Orders',
    icon: ShoppingBag,
    path: '/orders',
    level: 0,
  },
  {
    name: 'Customers',
    icon: Users,
    path: '/customers',
    level: 0,
  },
  {
    name: 'Supply Chain',
    icon: Package,
    path: '/supply',
    level: 0,
  },
  {
    name: 'Analytics & Reporting',
    icon: BarChart2,
    path: '/analytics',
    level: 0,
  },
];

const utilityItems = [
    {
      name: 'System Settings',
      icon: Settings,
      path: '/settings',
      level: 0,
    },
    {
      name: 'Log Out',
      icon: LogOut,
      path: '/logout',
      level: 0,
      isLogout: true,
    },
];
// --- End UI Data ---

/**
 * AEON Admin Panel Sidebar Component (Pure Static UI)
 * Renders a flat navigation list.
 */
export const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  }; 

  // Helper function to render a single link (pure UI element, no accordion logic)
  const renderLink = (item) => { 
    // Uses the item's specific icon, or defaults to a gray circle if none is specified
    const Icon = item.icon || Circle; 

    // Unified styling for all links
    const baseClasses = `
      flex items-center w-full transition-all duration-200 cursor-pointer rounded-sm
      pl-6 py-4 text-sm font-medium tracking-wide uppercase
    `;

    // High-contrast active state and hover effect for all links
    const activeClasses = 'bg-gray-900 text-white shadow-lg';
    const inactiveClasses = 'text-gray-700 hover:bg-gray-100'; 
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/admin'} // Only match exactly for dashboard
        className={({ isActive }) => 
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
        onClick={onClose}
      >
        <Icon className={`mr-4 w-5 h-5`} />
        <span>{item.name}</span>
      </NavLink>
    );
  };
  
  // Logic to flatten the navItems array for rendering (now simplified as there are no subItems)
  const flattenedNav = navItems.reduce((acc, item) => {
      // Since subItems are removed from the data structure, we only push primary items
      if (!item.subItems) {
          acc.push(item);
      }
      return acc;
  }, []);

  return (
    // Sidebar Container: Set height to h-screen (100vh)
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col font-sans shadow-2xl">
      
      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* 1. Branding Header - AEON */}
      <div className="py-6 px-6 mb-6 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-widest leading-none">
          AEON
        </h1>
        <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">
          ADMIN PANEL
        </p>
      </div>

      {/* 2. Primary Navigation (Core Operations) - Iterates over the simplified list */}
      <nav className="flex-grow space-y-1 overflow-y-auto px-2">
        {flattenedNav.map((item) => renderLink(item))}
      </nav>
      
      {/* 3. Utility and Footer Items (Settings, Logout) */}
      <div className="p-4 px-2">
        {utilityItems.map((item, i) => (
          item.isLogout ? (
            <button 
              key={i} 
              onClick={handleLogout} 
              className="flex items-center w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <item.icon className="mr-2 w-5 h-5"/>
              {item.name}
            </button>
          ) : (
            <NavLink 
              key={i} 
              to={item.path} 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
            >
              <item.icon className="mr-2 w-5 h-5"/>
              {item.name}
            </NavLink>
          )
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;

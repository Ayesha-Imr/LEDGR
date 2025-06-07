import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, ShoppingCart, PieChart, BarChart3, Wallet, User } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center px-4 py-3 text-sm font-medium rounded-lg
      ${isActive 
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' 
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }
      transition-colors duration-150 ease-in-out
    `}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out md:static md:z-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
              LEDGR
            </h2>
            <button 
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem 
              to="/dashboard" 
              icon={<Home size={20} />} 
              label="Dashboard" 
              onClick={onClose}
            />
            <NavItem 
              to="/dashboard/orders" 
              icon={<ShoppingCart size={20} />} 
              label="Orders" 
              onClick={onClose}
            />
            <NavItem 
              to="/dashboard/categories" 
              icon={<PieChart size={20} />} 
              label="Categories" 
              onClick={onClose}
            />
            <NavItem 
              to="/dashboard/analytics" 
              icon={<BarChart3 size={20} />} 
              label="Analytics" 
              onClick={onClose}
            />
            <NavItem 
              to="/dashboard/budgets" 
              icon={<Wallet size={20} />} 
              label="Budgets" 
              onClick={onClose}
            />
            <NavItem 
              to="/dashboard/profile" 
              icon={<User size={20} />} 
              label="Profile" 
              onClick={onClose}
            />
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              &copy; 2025 LEDGR
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
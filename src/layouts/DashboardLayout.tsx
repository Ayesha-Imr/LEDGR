import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const DashboardLayout: React.FC = () => {
  const { user } = useStore();
  const { fetchOrders, fetchLineItems, fetchBudgets } = useDataStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Fetch data when dashboard mounts
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load initial data
    fetchOrders();
    fetchLineItems();
    fetchBudgets();
  }, [user, navigate, fetchOrders, fetchLineItems, fetchBudgets]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar - hidden on mobile by default */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { useStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const navigateToProfile = () => {
    navigate('/dashboard/profile');
    setDropdownOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Menu button (mobile) and Logo */}
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 md:hidden"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-2 md:ml-0 flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
              LEDGR
            </h1>
          </div>
        </div>
        
        {/* Right: User menu and theme toggle */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-indigo-600" />
            )}
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open user menu"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  {user?.email}
                </div>
                <button
                  onClick={navigateToProfile}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
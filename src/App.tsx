import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetsPage from './pages/BudgetsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/common/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { user, isLoading } = useStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/login" />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Redirect from root to dashboard or login */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
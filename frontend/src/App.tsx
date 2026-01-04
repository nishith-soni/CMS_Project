// ===========================================
// App Component - Main Application Router
// ===========================================
// 
// WHY THIS FILE?
// Sets up all application routes and layout.
// Uses React Router for client-side navigation.

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// CMS Pages
import PostsPage from './pages/cms/PostsPage';
import PostFormPage from './pages/cms/PostFormPage';
import CategoriesPage from './pages/cms/CategoriesPage';

// CRM Pages
import ContactsPage from './pages/crm/ContactsPage';
import LeadsPage from './pages/crm/LeadsPage';
import DealsPage from './pages/crm/DealsPage';

// ERP Pages
import ProductsPage from './pages/erp/ProductsPage';
import CustomersPage from './pages/erp/CustomersPage';
import OrdersPage from './pages/erp/OrdersPage';
import InvoicesPage from './pages/erp/InvoicesPage';

// Settings
import UsersPage from './pages/settings/UsersPage';

// ===========================================
// Protected Route Component
// ===========================================
// WHY: Prevents unauthenticated users from accessing protected pages
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// ===========================================
// Public Route Component
// ===========================================
// WHY: Redirects authenticated users away from login/register
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// ===========================================
// Main App Component
// ===========================================
function App() {
  return (
    <Routes>
      {/* ===========================================
          Public Routes (Login, Register)
          =========================================== */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* ===========================================
          Protected Routes (Dashboard, CMS, CRM, ERP)
          =========================================== */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* CMS Routes */}
        <Route path="/cms/posts" element={<PostsPage />} />
        <Route path="/cms/posts/new" element={<PostFormPage />} />
        <Route path="/cms/posts/:id/edit" element={<PostFormPage />} />
        <Route path="/cms/categories" element={<CategoriesPage />} />
        
        {/* CRM Routes */}
        <Route path="/crm/contacts" element={<ContactsPage />} />
        <Route path="/crm/leads" element={<LeadsPage />} />
        <Route path="/crm/deals" element={<DealsPage />} />
        
        {/* ERP Routes */}
        <Route path="/erp/products" element={<ProductsPage />} />
        <Route path="/erp/customers" element={<CustomersPage />} />
        <Route path="/erp/orders" element={<OrdersPage />} />
        <Route path="/erp/invoices" element={<InvoicesPage />} />
        
        {/* Settings */}
        <Route path="/settings/users" element={<UsersPage />} />
      </Route>
      
      {/* ===========================================
          Redirects
          =========================================== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

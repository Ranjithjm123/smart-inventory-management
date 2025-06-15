
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminInventory from "./pages/admin/Inventory";
import AdminSales from "./pages/admin/Sales";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import CashierPos from "./pages/cashier/Pos";
import CashierHistory from "./pages/cashier/History";
import NotFound from "./pages/NotFound";
import CashiersPage from "./pages/admin/Cashiers";
import CashierSalesHistory from "./pages/admin/CashierSalesHistory"; // <-- add this import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole?: "admin" | "cashier"; 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      {/* Admin routes */}
      <Route path="/admin/inventory" element={
        <ProtectedRoute allowedRole="admin">
          <AdminInventory />
        </ProtectedRoute>
      } />
      <Route path="/admin/sales" element={
        <ProtectedRoute allowedRole="admin">
          <AdminSales />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRole="admin">
          <AdminReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRole="admin">
          <AdminSettings />
        </ProtectedRoute>
      } />
      {/* Cashier management view */}
      <Route path="/admin/cashiers" element={
        <ProtectedRoute allowedRole="admin">
          <CashiersPage />
        </ProtectedRoute>
      } />
      {/* Individual cashier's sales page */}
      <Route path="/admin/cashiers/:cashierId" element={
        <ProtectedRoute allowedRole="admin">
          <CashierSalesHistory />
        </ProtectedRoute>
      } />
      {/* Cashier routes */}
      <Route path="/cashier/pos" element={
        <ProtectedRoute>
          <CashierPos />
        </ProtectedRoute>
      } />
      <Route path="/cashier/history" element={
        <ProtectedRoute>
          <CashierHistory />
        </ProtectedRoute>
      } />
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


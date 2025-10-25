import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Core Auth Page ---
import AuthPage from './pages/AuthPage';

// --- User Dashboard Pages ---
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

// --- Admin Dashboard Pages ---
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageTransactionsPage from './pages/ManageTransactionsPage';
import ManageAdminsPage from './pages/ManageAdminsPage'; // <-- 1. IMPORT THIS NEW PAGE

function App() {
  return (
    <Routes>
      {/* ======================================= */}
      {/* Public Route                    */}
      {/* ======================================= */}
      {/* Login and Register Page */}
      <Route path="/" element={<AuthPage />} />


      {/* ======================================= */}
      {/* User Routes (Protected)         */}
      {/* ======================================= */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Main dashboard page */}
        <Route index element={<DashboardPage />} />
        
        {/* User's portfolio page */}
        <Route path="portfolio" element={<PortfolioPage />} />
        
        {/* User's transaction history page */}
        <Route path="history" element={<HistoryPage />} />
        
        {/* User's profile/settings page */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>


      {/* ======================================= */}
      {/* Admin Routes (Protected)        */}
      {/* ======================================= */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Admin's main dashboard (price updates) */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        
        {/* Page to see all users */}
        <Route path="users" element={<ManageUsersPage />} />

        {/* --- 2. ADD THE NEW ROUTE HERE --- */}
        <Route path="admins" element={<ManageAdminsPage />} />
        
        {/* Page to see all transactions */}
        <Route path="transactions" element={<ManageTransactionsPage />} />
      </Route>
      
    </Routes>
  );
}

export default App;
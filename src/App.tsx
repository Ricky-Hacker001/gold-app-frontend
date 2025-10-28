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
import ManageAdminsPage from './pages/ManageAdminsPage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import PayoutsAwaitingCompletionPage from './pages/PayoutsAwaitingCompletionPage';

// --- Payment Status Page (IMPORT THIS) ---
import PaymentStatusPage from './pages/PaymentStatusPage';


function App() {
  return (
    <Routes>
      {/* ======================================= */}
      {/* Public Routes                   */}
      {/* ======================================= */}
      <Route path="/" element={<AuthPage />} />

      {/* --- ADD THIS ROUTE --- */}
      <Route path="/payment-status" element={<PaymentStatusPage />} />
      {/* --- END ADD --- */}


      {/* ======================================= */}
      {/* User Routes (Protected)         */}
      {/* ======================================= */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>


      {/* ======================================= */}
      {/* Admin Routes (Protected)        */}
      {/* ======================================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="admins" element={<ManageAdminsPage />} />
        <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="payouts-awaiting" element={<PayoutsAwaitingCompletionPage />} />
        <Route path="transactions" element={<ManageTransactionsPage />} />
      </Route>

    </Routes>
  );
}

export default App;
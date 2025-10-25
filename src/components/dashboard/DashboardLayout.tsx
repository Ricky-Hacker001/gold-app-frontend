import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // --- Auth Check ---
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to login if no token
    }
    // In a real app, you'd also verify this token with the backend
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-200">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Child routes (DashboardPage, PortfolioPage, etc.) will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
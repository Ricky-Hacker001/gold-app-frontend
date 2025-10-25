import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from './AdminSidebar';

interface DecodedToken {
  role: 'user' | 'admin';
  exp: number;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // --- Admin-Specific Auth Check ---
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Not logged in
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.role !== 'admin') {
        navigate('/dashboard'); // Not an admin, kick to user dashboard
      }
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/'); // Token expired
      }
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/'); // Invalid token
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-200">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
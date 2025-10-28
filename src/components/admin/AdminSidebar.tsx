import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaDollarSign,
  FaUsers,
  FaHistory,
  FaSignOutAlt,
  FaUserShield,
  FaHandHoldingUsd // <-- ADD THIS ICON TO THE IMPORT LIST
} from 'react-icons/fa';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `flex items-center p-3 rounded-lg transition-colors ${
      isActive ? 'bg-yellow-500 text-slate-900' : 'text-gray-300 hover:bg-slate-700 hover:text-white' // Added hover:text-white
    }`;
  };

  return (
    <div className="w-64 bg-slate-800 h-screen p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Admin <span className="text-yellow-500">Panel</span>
        </h1>
        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" end className={getNavLinkClass}>
            <FaDollarSign className="mr-3" size={20} />
            Update Price
          </NavLink>
          <NavLink to="/admin/users" className={getNavLinkClass}>
            <FaUsers className="mr-3" size={20} />
            Manage Users
          </NavLink>
          <NavLink to="/admin/admins" className={getNavLinkClass}>
            <FaUserShield className="mr-3" size={20} />
            Manage Admins
          </NavLink>
          {/* --- NEW LINK for Withdrawals --- */}
          <NavLink to="/admin/withdrawals" className={getNavLinkClass}>
            <FaHandHoldingUsd className="mr-3" size={20} /> {/* This line is now valid */}
            Withdrawals
          </NavLink>
          {/* --- END NEW --- */}
          <NavLink to="/admin/payouts-awaiting" className={getNavLinkClass}>
            <FaHandHoldingUsd className="mr-3" size={20} />
            Payouts Awaiting Payment
          </NavLink>
          <NavLink to="/admin/transactions" className={getNavLinkClass}>
            <FaHistory className="mr-3" size={20} />
            All Transactions
          </NavLink>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-700 hover:text-white transition-colors" // Added hover:text-white
      >
        <FaSignOutAlt className="mr-3" size={20} />
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartArea,
  FaHistory,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa'; // <-- CHANGED TO FONT AWESOME

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    navigate('/'); // Redirect to login
  };

  // Helper function for NavLink styling
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `flex items-center p-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-yellow-500 text-slate-900'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`;
  };

  return (
    <div className="w-64 bg-slate-800 h-screen p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Gold<span className="text-yellow-500">App</span>
        </h1>
        <nav className="space-y-2">
          {/* --- ICONS UPDATED BELOW --- */}
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <FaHome className="mr-3" size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/portfolio" className={getNavLinkClass}>
            <FaChartArea className="mr-3" size={20} />
            Portfolio
          </NavLink>
          <NavLink to="/dashboard/history" className={getNavLinkClass}>
            <FaHistory className="mr-3" size={20} />
            History
          </NavLink>
          <NavLink to="/dashboard/settings" className={getNavLinkClass}>
            <FaUser className="mr-3" size={20} />
            Profile & Settings
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-700 hover:text-white transition-colors"
      >
        <FaSignOutAlt className="mr-3" size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
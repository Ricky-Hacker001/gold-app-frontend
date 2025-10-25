import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaDollarSign, FaUsers, FaHistory, FaSignOutAlt, FaUserShield } from 'react-icons/fa'; // <-- Updated

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `flex items-center p-3 rounded-lg transition-colors ${
      isActive ? 'bg-yellow-500 text-slate-900' : 'text-gray-300 hover:bg-slate-700'
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
          {/* --- UPDATED/NEW LINKS --- */}
          <NavLink to="/admin/users" className={getNavLinkClass}> {/* <-- Updated path */}
            <FaUsers className="mr-3" size={20} />
            Manage Users
          </NavLink>
          <NavLink to="/admin/admins" className={getNavLinkClass}> {/* <-- New */}
            <FaUserShield className="mr-3" size={20} />
            Manage Admins
          </NavLink>
          {/* --- END --- */}
          <NavLink to="/admin/transactions" className={getNavLinkClass}>
            <FaHistory className="mr-3" size={20} />
            Transactions
          </NavLink>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-700"
      >
        <FaSignOutAlt className="mr-3" size={20} />
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
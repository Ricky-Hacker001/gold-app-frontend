import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import UserDetailsModal from '../components/admin/UserDetailsModal'; // <-- Import the new modal

// Update Interface: Must match the data fetched from the backend (including bank/KYC)
interface UserPortfolio {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
  totalGrams: number | string;
  totalInvested: number | string; // Cost Basis of held gold (from backend)
  currentValue: number | string;
  profit: number | string;
  
  // ADDED KYC/Bank Fields
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  pan_card_number: string | null;
  aadhaar_card_number: string | null;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- MODAL STATE ---
  const [selectedUser, setSelectedUser] = useState<UserPortfolio | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // This API now returns ALL user details including KYC/Bank
        const res = await api.get('/admin/users-portfolio'); 
        setUsers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatValue = (value: number | string, decimals: number): string => {
    const num = parseFloat(value as string);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };
  
  // Open modal handler
  const openModal = (user: UserPortfolio) => {
      setSelectedUser(user);
  }
  // Close modal handler
  const closeModal = () => {
      setSelectedUser(null);
  }


  if (loading) return <p className="text-gray-400">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Manage Users</h1>
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-slate-700 text-sm text-gray-200 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Name/Email</th>
                <th scope="col" className="px-6 py-3">Gold Held</th>
                <th scope="col" className="px-6 py-3">Cost Basis</th>
                <th scope="col" className="px-6 py-3">P/L</th>
                <th scope="col" className="px-6 py-3">Actions</th> {/* <-- Added Action column */}
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const profit = parseFloat(user.profit as string);
                
                return (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-600/30">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div>{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    {/* Gold Held */}
                    <td className="px-6 py-4">{formatValue(user.totalGrams, 4)} g</td>
                    {/* Cost Basis */}
                    <td className="px-6 py-4">₹{formatValue(user.totalInvested, 2)}</td>
                    {/* P/L */}
                    <td className={`px-6 py-4 font-bold ${
                      profit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {profit >= 0 ? '+' : ''}₹{formatValue(profit, 2)}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                        <button 
                            onClick={() => openModal(user)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded"
                        >
                            View Details
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- Modal Rendering --- */}
      {selectedUser && (
        <UserDetailsModal 
            user={selectedUser} 
            onClose={closeModal} 
        />
      )}
    </>
  );
};

export default ManageUsersPage;
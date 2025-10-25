import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface UserPortfolio {
  id: number;
  name: string;
  email: string;
  phone: string;
  // These might be coming from the API as strings
  totalGrams: number | string; 
  totalInvested: number | string;
  currentValue: number | string;
  profit: number | string;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Call the new /api/admin/users-portfolio endpoint
        const res = await api.get('/admin/users-portfolio');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p className="text-gray-400">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Manage Users</h1>
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-slate-700 text-sm text-gray-200 uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">User</th>
              <th scope="col" className="px-6 py-3">Gold</th>
              <th scope="col" className="px-6 py-3">Invested</th>
              <th scope="col" className="px-6 py-3">Current Value</th>
              <th scope="col" className="px-6 py-3">Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              // --- FIX: Convert all values to numbers ---
              const totalGrams = parseFloat(user.totalGrams as string);
              const totalInvested = parseFloat(user.totalInvested as string);
              const currentValue = parseFloat(user.currentValue as string);
              const profit = parseFloat(user.profit as string);
              // --- END FIX ---
              
              return (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-600/30">
                  <td className="px-6 py-4">
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </td>
                  {/* Apply .toFixed() to the new number variables */}
                  <td className="px-6 py-4">{totalGrams.toFixed(4)} g</td>
                  <td className="px-6 py-4">₹{totalInvested.toFixed(2)}</td>
                  <td className="px-6 py-4">₹{currentValue.toFixed(2)}</td>
                  <td className={`px-6 py-4 font-bold ${
                    profit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {profit >= 0 ? '+' : ''}₹{profit.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;
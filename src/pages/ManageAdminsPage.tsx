import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const ManageAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [emailToPromote, setEmailToPromote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (err) {
      setError('Failed to load admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle promotion form submission
  const handlePromote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/promote-admin', { email: emailToPromote });
      setMessage({ type: 'success', text: res.data.message });
      setEmailToPromote('');
      fetchAdmins(); // Refresh the admin list
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to promote user.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Manage Admins</h1>
      
      {/* --- Form to add new admin --- */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Promote User to Admin</h2>
        <form onSubmit={handlePromote}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            User's Email
          </label>
          <div className="flex space-x-2 mt-1">
            <input
              type="email"
              id="email"
              value={emailToPromote}
              onChange={(e) => setEmailToPromote(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              placeholder="user@example.com"
              required
            />
            <button
              type="submit"
              className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Promoting...' : 'Promote'}
            </button>
          </div>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* --- List of current admins --- */}
      <h2 className="text-2xl font-bold text-white mb-4">Current Admins</h2>
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
        {loading && <p className="p-6 text-gray-400">Loading admins...</p>}
        {error && <p className="p-6 text-red-500">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left text-gray-300">
            <thead className="bg-slate-700 text-sm text-gray-200 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Contact</th>
                <th scope="col" className="px-6 py-3">Admin Since</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-slate-700 hover:bg-slate-600/30">
                  <td className="px-6 py-4">{admin.name}</td>
                  <td className="px-6 py-4">
                    <div>{admin.email}</div>
                    <div className="text-sm text-gray-400">{admin.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(admin.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAdminsPage;
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface Transaction {
  id: number;
  type: 'buy' | 'withdraw';
  status: 'pending' | 'completed' | 'failed';
  amount_inr: number;
  grams: number;
  price_per_gram: number;
  created_at: string;
}

const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Call the /api/transactions/my endpoint
        const res = await api.get('/transactions/my');
        setTransactions(res.data);
      } catch (err) {
        setError('Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Helper to style the status
  const formatStatus = (status: string) => (
    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
      status === 'completed' ? 'bg-green-700 text-green-100' :
      status === 'pending' ? 'bg-yellow-700 text-yellow-100' :
      'bg-red-700 text-red-100'
    }`}>
      {status.toUpperCase()}
    </span>
  );

  if (loading) return <p className="text-gray-400">Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Transaction History</h1>
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-slate-700 text-sm text-gray-200 uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Grams</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">No transactions found.</td>
              </tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-600/30">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize">{t.type}</td>
                  <td className="px-6 py-4">{formatStatus(t.status)}</td>
                  <td className="px-6 py-4">₹{t.amount_inr}</td>
                  <td className="px-6 py-4">{t.grams} g</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;
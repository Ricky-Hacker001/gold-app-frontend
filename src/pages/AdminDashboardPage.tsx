import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboardPage: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gold/price');
      setCurrentPrice(res.data.price);
      setNewPrice(res.data.price.toString()); // Pre-fill the input
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to fetch current price' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  const handlePriceUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/price',
        { newPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: res.data.message });
      await fetchPrice(); // Refresh the displayed price
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update price';
      setMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Update Gold Price</h1>
      
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-400">Current Price (per gram)</h2>
          <p className="text-4xl font-bold text-yellow-500">
            {loading ? 'Loading...' : `₹${currentPrice.toFixed(2)}`}
          </p>
        </div>

        <form onSubmit={handlePriceUpdate}>
          <label htmlFor="newPrice" className="block text-sm font-medium text-gray-300">
            Set New Price
          </label>
          <input
            type="number"
            step="0.01"
            id="newPrice"
            name="newPrice"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            required
          />
          
          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md"
          >
            Update Price
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.type === 'success' ? 'bg-green-800 border-green-600 text-white' : 'bg-red-800 border-red-600 text-white'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
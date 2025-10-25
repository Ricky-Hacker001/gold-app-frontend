import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Use our API helper

// 1. Update the interface to include new data
interface PortfolioData {
  totalGrams: number;
  currentValue: number;
  totalInvested: number; // <-- NEW
  profit: number;       // <-- NEW
  pricePerGram: number;
}

const PortfolioPage: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        // This API call now returns the new data
        const res = await api.get('/portfolio'); 
        setData(res.data);
      } catch (err) {
        setError('Failed to load portfolio.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) return <p className="text-gray-400">Loading portfolio...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">My Portfolio</h1>
      
      {/* 2. Updated grid to show all 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Total Gold */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Total Gold</h2>
          <p className="text-4xl font-bold text-yellow-500">
            {data?.totalGrams.toFixed(4) || '0.0000'} g
          </p>
        </div>

        {/* Card 2: Current Value */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Current Value</h2>
          <p className="text-4xl font-bold text-white">
            ₹{data?.currentValue.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            (@ ₹{data?.pricePerGram.toFixed(2)}/g)
          </p>
        </div>

        {/* Card 3: Total Invested (NEW) */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Total Invested</h2>
          <p className="text-4xl font-bold text-white">
            ₹{data?.totalInvested.toFixed(2) || '0.00'}
          </p>
        </div>

        {/* Card 4: Total Profit / Loss (NEW) */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Total Profit / Loss</h2>
          {/* Dynamically sets color to green (profit) or red (loss) */}
          <p className={`text-4xl font-bold ${
            (data?.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            { (data?.profit || 0) >= 0 ? '+' : '' }₹{data?.profit.toFixed(2) || '0.00'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default PortfolioPage;
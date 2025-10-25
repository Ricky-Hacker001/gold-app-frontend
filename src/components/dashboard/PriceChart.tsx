import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Define the shape of the data we expect from the API
interface ChartData {
  name: string;
  price: number;
}

const PriceChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Call our new backend endpoint
        const res = await axios.get('http://localhost:5000/api/gold/history');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []); // Runs once on component mount

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-400">Loading Chart...</p>
      </div>
    );
  }

  if (!data.length) {
     return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-red-500">No chart data available.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data} // <-- USE REAL DATA
        margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis
          stroke="#9ca3af"
          domain={['dataMin - 50', 'dataMax + 50']}
          tickFormatter={(value) => `₹${value.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
          labelStyle={{ color: '#f3f4f6' }}
          itemStyle={{ color: '#eab308' }}
          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#eab308"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
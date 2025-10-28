import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; // Use our API helper

// Interface matching the backend response (Average Cost Basis Calculation)
interface PortfolioData {
  totalGrams: number;
  currentValue: number;
  investedAmount: number; // Cost Basis of held gold
  profitLoss: number;     // Profit/Loss based on Cost Basis
  pricePerGram: number;
}

const PortfolioPage: React.FC = () => {
  // --- States for Portfolio Data ---
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // --- States for Sell Form ---
  const [gramsToSell, setGramsToSell] = useState<string>('');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [sellMessage, setSellMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingSell, setIsSubmittingSell] = useState<boolean>(false);

  // --- Fetch Portfolio Data ---
  const fetchPortfolio = useCallback(async () => {
    try {
      setPortfolioError(null);
      console.log("Fetching portfolio data...");
      const res = await api.get('/portfolio'); // API returns avg cost basis data
      console.log("Portfolio data received:", res.data);
      setPortfolioData(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to load portfolio data.';
      setPortfolioError(errMsg);
      console.error("Portfolio fetch error:", err.response?.data || err.message);
    } finally {
      setLoadingPortfolio(false); // Ensure loading stops
    }
  }, []); // Empty dependency array means this function definition is stable

  // Fetch portfolio data on initial component mount
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]); // fetchPortfolio is stable due to useCallback

  // --- Handle Grams Input Change & Calculate Value ---
  const handleGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const grams = e.target.value;
    setGramsToSell(grams);
    setSellMessage(null); // Clear previous messages

    // Use fetched pricePerGram for calculation
    if (portfolioData?.pricePerGram && portfolioData.pricePerGram > 0) {
      const numericGrams = parseFloat(grams);
      if (!isNaN(numericGrams) && numericGrams > 0) {
        setEstimatedValue(numericGrams * portfolioData.pricePerGram);
      } else {
        setEstimatedValue(0);
      }
    } else {
      setEstimatedValue(0);
    }
  };

  // --- Handle Sell Request Submission (Updated with KYC Check) ---
  const handleSellSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSellMessage(null);
    setIsSubmittingSell(true);
    const grams = parseFloat(gramsToSell);

    // Frontend validation
    if (isNaN(grams) || grams <= 0) {
      setSellMessage({ type: 'error', text: 'Please enter a valid amount of grams.' });
      setIsSubmittingSell(false);
      return;
    }
    // Ensure portfolioData exists before checking totalGrams
    if (!portfolioData || grams > portfolioData.totalGrams) {
       setSellMessage({ type: 'error', text: `Insufficient balance. Available: ${portfolioData?.totalGrams.toFixed(4) ?? '0.0000'}g.` });
       setIsSubmittingSell(false);
       return;
    }

    try {
      console.log(`Submitting sell request for ${grams}g`);
      const res = await api.post('/sell/request', { gramsToSell: grams });
      console.log("Sell request response:", res.data);
      setSellMessage({ type: 'success', text: res.data.message || 'Withdrawal request submitted!' });
      setGramsToSell(''); // Clear form
      setEstimatedValue(0);
      // Refresh portfolio data immediately after successful request
      setTimeout(() => fetchPortfolio(), 100);

    } catch (err: any) { // Type assertion
      const responseMessage = err.response?.data?.message || 'Failed to submit withdrawal request.';
      const errorCode = err.response?.data?.code; // Capture the custom error code

      if (errorCode === 'KYC_REQUIRED') {
          // --- Highlight the required action ---
          setSellMessage({
              type: 'error',
              text: '⚠️ Withdrawal Blocked: Complete your Bank and KYC details in Profile & Settings first.'
          });
      } else {
          setSellMessage({ type: 'error', text: responseMessage });
      }

      console.error("Sell request error:", err.response?.data || err.message);
    } finally {
      setIsSubmittingSell(false);
    }
  };

  // --- Loading/Error Display for Portfolio ---
  if (loadingPortfolio && !portfolioData) { // Show loading only on initial load
    return <p className="text-gray-400 text-center p-6 animate-pulse">Loading portfolio...</p>;
  }
  if (portfolioError) {
      return <p className="text-red-500 text-center p-6">Error: {portfolioError}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">My Portfolio</h1>

      {/* --- Portfolio Summary Cards (Displaying Cost Basis and Unrealized P/L) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Card 1: Total Gold Held */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Total Gold Held</h2>
          <p className="text-4xl font-bold text-yellow-500">
            {portfolioData?.totalGrams?.toFixed(4) ?? '0.0000'} g
          </p>
        </div>

        {/* Card 2: Current Value */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Current Value</h2>
          <p className="text-4xl font-bold text-white">
            ₹{portfolioData?.currentValue?.toFixed(2) ?? '0.00'}
          </p>
           <p className="text-sm text-gray-400 mt-1">
            (@ ₹{portfolioData?.pricePerGram?.toFixed(2) ?? 'N/A'}/g)
          </p>
        </div>

        {/* Card 3: Invested Amount (Cost Basis) */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Invested Amount (Cost)</h2>
          <p className="text-4xl font-bold text-white">
            {/* Displaying investedAmount (Cost Basis) */}
            ₹{portfolioData?.investedAmount?.toFixed(2) ?? '0.00'}
          </p>
           <p className="text-xs text-gray-400 mt-1">
             (Avg. cost basis of gold held)
          </p>
        </div>

        {/* Card 4: Unrealized Profit / Loss */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Unrealized Profit / Loss</h2>
          <p className={`text-4xl font-bold ${
            (portfolioData?.profitLoss ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {/* Displaying profitLoss (Unrealized P/L) */}
            { (portfolioData?.profitLoss ?? 0) >= 0 ? '+' : '' }₹{portfolioData?.profitLoss?.toFixed(2) ?? '0.00'}
          </p>
           <p className="text-xs text-gray-400 mt-1">
             (Based on avg. cost)
           </p>
        </div>
      </div>

      {/* --- Sell Gold / Request Withdrawal Card --- */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Sell Gold (Request Withdrawal)</h2>

        <form onSubmit={handleSellSubmit}>
          {/* Grams Input */}
          <div className="mb-4">
            <label htmlFor="grams" className="block text-sm font-medium text-gray-300 mb-1">
              Enter Grams to Sell
            </label>
            <input
              type="number"
              step="0.0001" // Allow fine decimal input
              id="grams"
              placeholder="e.g., 10.5"
              className="flex-1 w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={gramsToSell}
              onChange={handleGramsChange}
              disabled={isSubmittingSell || loadingPortfolio || !portfolioData?.pricePerGram}
            />
             <p className="text-xs text-gray-400 mt-1">
                Available Balance: {portfolioData?.totalGrams?.toFixed(4) ?? '0.0000'}g
             </p>
          </div>

          {/* Estimated Value Display */}
          <div className="mb-4">
            <p className="text-sm text-gray-400">Estimated Value:</p>
            <p className="text-2xl font-bold text-white">₹{estimatedValue.toFixed(2)}</p>
            {portfolioData?.pricePerGram && (
                 <p className="text-xs text-gray-400">(@ current price of ₹{portfolioData.pricePerGram.toFixed(2)}/g)</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-opacity disabled:opacity-50"
            // More robust disable check including balance and positive grams
            disabled={
                isSubmittingSell ||
                loadingPortfolio ||
                !portfolioData?.pricePerGram ||
                estimatedValue <= 0 ||
                !portfolioData?.totalGrams || // Ensure totalGrams exists
                parseFloat(gramsToSell || '0') <= 0 || // Ensure gramsToSell is positive
                parseFloat(gramsToSell || '0') > portfolioData.totalGrams // Ensure enough balance
            }
          >
            {isSubmittingSell ? 'Submitting Request...' : 'Request Withdrawal'}
          </button>

          {/* Message Display Area */}
          {sellMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              sellMessage.type === 'success'
                ? 'bg-green-800 border border-green-600 text-white'
                : 'bg-red-800 border border-red-600 text-white'
            }`}>
              {sellMessage.text}
            </div>
          )}
        </form>
      </div>

    </div>
  );
};

export default PortfolioPage;
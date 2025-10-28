import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Use our API helper
import PriceChart from '../components/dashboard/PriceChart';

// Update the declaration to prioritize the uppercase C constructor
declare global {
  interface Window {
    Cashfree?: any; // The constructor (Uppercase C)
    cashfree?: any; // Keep lowercase just in case (though likely unused)
  }
}

const DashboardPage: React.FC = () => {
  // --- States for price fetching ---
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState<boolean>(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  // --- States for the Buy Gold form ---
  const [amountInRupees, setAmountInRupees] = useState<string>('');
  const [gramsToBuy, setGramsToBuy] = useState<string>('0.0000');
  const [buyMessage, setBuyMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Effect 1: Fetch current gold price ---
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoadingPrice(true);
        setPriceError(null);
        const res = await api.get('/gold/price');
        setGoldPrice(res.data.price);
      } catch (err) {
        console.error("Error fetching price:", err);
        setPriceError('Failed to load gold price.');
      } finally {
        setLoadingPrice(false);
      }
    };
    fetchPrice();
  }, []);

  // --- Effect 2 (Dynamic SDK loading) REMOVED - Assuming script is in index.html ---

  // --- Update grams calculation ---
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setAmountInRupees(amount);
    if (goldPrice && goldPrice > 0) {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount) && numericAmount > 0) {
        setGramsToBuy((numericAmount / goldPrice).toFixed(4));
      } else {
        setGramsToBuy('0.0000');
      }
    }
  };

  // --- Handle purchase submission (Using Uppercase C constructor and _self redirect) ---
  const handleBuySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBuyMessage(null);
    setIsSubmitting(true);
    const amount = parseFloat(amountInRupees);

    if (isNaN(amount) || amount <= 0) {
      setBuyMessage({ type: 'error', text: 'Please enter a valid amount.' });
      setIsSubmitting(false);
      return;
    }

    // Check for window.Cashfree (Uppercase C - the constructor)
    if (typeof window.Cashfree === 'undefined') {
        console.error("handleBuySubmit: window.Cashfree constructor not found!");
        setBuyMessage({ type: 'error', text: 'Payment SDK failed to load. Please refresh the page and try again.' });
        setIsSubmitting(false);
        return; // Stop execution
    }

    let paymentSessionId: string | null = null;

    try {
      // 1. Call Backend to get paymentSessionId
      console.log("Calling backend to create order for amount:", amount);
      const res = await api.post('/buy/create-order', {
        amountInRupees: amount,
      });
      paymentSessionId = res.data.paymentSessionId;
      console.log("Received paymentSessionId:", paymentSessionId);

      if (!paymentSessionId) {
        throw new Error("Payment Session ID not received from backend.");
      }

      // Initialize Frontend SDK Instance
      console.log("Initializing Frontend Cashfree SDK instance with mode: sandbox...");
      const cashfree = new window.Cashfree({
          mode: "sandbox" // Or "production" based on your env
      });
      console.log("Frontend instance created.");


      // Call checkout on the instance WITH _self redirect target
      console.log("Attempting to launch Cashfree checkout with redirectTarget: _self...");
      cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self" // <--- FORCE FULL PAGE REDIRECT
      });
      console.log("Cashfree checkout called (expecting full page redirect).");
      // Button will stay 'Initializing...' because the page should navigate away

    } catch (err: any) {
      console.error("Error during payment initiation:", err); // Log the actual error
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed.';
      setBuyMessage({ type: 'error', text: msg });
      setIsSubmitting(false); // Re-enable button on ANY failure
    }
  };

  // --- Helper to display price ---
  const renderPrice = () => {
    if (loadingPrice) {
      return <p className="text-4xl font-bold text-yellow-500 animate-pulse">Loading...</p>;
    }
    if (priceError) {
      return <p className="text-2xl font-bold text-red-500">{priceError}</p>;
    }
    if (goldPrice !== null) {
      return <p className="text-4xl font-bold text-yellow-500">₹{goldPrice.toFixed(2)}</p>;
    }
    return <p className="text-4xl font-bold text-gray-500">N/A</p>;
  };

  // --- Determine button text ---
  const getButtonText = () => {
      if (isSubmitting) return 'Initializing...';
      return 'Proceed to Payment';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {/* Removed SDK Error Display */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* --- Gold Price Display Card --- */}
        <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-sm font-medium text-gray-400 mb-1">Current Gold Price (per gram)</h2>
          {renderPrice()}
        </div>

        {/* --- Buy Gold Form Card --- */}
        <div className="md:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Buy Gold</h2>

          <form onSubmit={handleBuySubmit}>
            {/* Amount Input */}
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                id="amount"
                placeholder="Enter Amount"
                className="flex-1 w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={amountInRupees}
                onChange={handleAmountChange}
                disabled={loadingPrice || isSubmitting}
              />
            </div>

            {/* Calculated Grams Display */}
            <div className="mb-4">
              <p className="text-sm text-gray-400">You will get (approx.):</p>
              <p className="text-2xl font-bold text-white">{gramsToBuy} g</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md transition-opacity disabled:opacity-50"
              disabled={loadingPrice || isSubmitting || !goldPrice}
            >
              {getButtonText()}
            </button>

            {/* Error Message Display Area */}
            {buyMessage && (
              <div className="mt-4 p-3 rounded-md text-sm bg-red-800 border border-red-600 text-white">
                {buyMessage.text}
              </div>
            )}
          </form>
        </div>

        {/* --- Price Chart Card --- */}
        <div className="md:col-span-3 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Price Chart (7 Days)</h2>
          <PriceChart />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; // Use our API helper

interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount_inr: number | string; 
  grams: number | string;
  price_per_gram: number | string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  status: 'pending' | 'pending_payout' | 'completed' | 'rejected' | 'failed' | string | null | undefined; 
}

const PayoutsAwaitingCompletionPage: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Function to fetch all requests with status 'pending' OR 'pending_payout'
  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/withdrawals/pending'); 

      // --- FIX: Map and normalize status before filtering ---
      const processedRequests = res.data.map((req: any) => ({
          ...req,
          // Normalize status to lowercase string without spaces
          status: String(req.status).toLowerCase().replace(/ /g, '_'),
      }));

      // Filter: Only keep requests that are awaiting manual payout completion
      const payoutsAwaitingCompletion = processedRequests.filter((req: any) => req.status === 'pending_payout');
      
      setRequests(payoutsAwaitingCompletion);
      console.log(`Found ${processedRequests.length} total, filtered ${payoutsAwaitingCompletion.length} awaiting payout.`);
      // --- END FIX ---

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payouts awaiting completion.');
      console.error("Fetch payouts error:", err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]); 

  // --- Handler Functions ---

  // Handler for completion: Admin confirms manual transfer and marks COMPLETED
  const handleComplete = async (id: number, amountInr: number) => {
    if (processingId) return;
    
    // Prompt for reference ID (UTR/Transfer ID)
    const refId = prompt(`Confirm manual transfer of ₹${amountInr.toFixed(2)}. Enter bank UTR/Reference ID:`);
    if (!refId || refId.trim() === '') {
      alert("Completion cancelled. Reference ID is required.");
      return;
    }

    setProcessingId(id);
    try {
      // Calls completion endpoint (/withdrawals/:id/complete)
      await api.post(`/admin/withdrawals/${id}/complete`, { referenceId: refId.trim() });
      
      // OPTIMISTIC UPDATE: Remove the completed item from the local list
      setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      
      alert(`Payout ${id} marked completed! Funds confirmed sent.`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to mark payout ${id} as complete.`;
      alert(`Error: ${errMsg}`);
      setError(errMsg);
      // If error, refresh the list to verify current status
      fetchPayouts();
    } finally {
      setProcessingId(null);
    }
  };

  // --- Render Helpers ---
  
  const formatStatus = (status: string) => {
      // Since this page only shows pending_payout, we simplify the visual text
      return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-700 text-blue-100">
              PAYOUT READY
          </span>
      );
  };
  
  const formatCurrency = (value: number | string): string => {
    const num = parseFloat(value as string);
    return isNaN(num) ? 'Error' : `₹${num.toFixed(2)}`;
  }
  
  if (loading) return <p className="text-gray-400 text-center p-6">Loading payouts...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Payouts Awaiting Completion</h1>

      {error && !loading && (
        <div className="mb-4 p-4 rounded-md text-sm bg-red-800 border border-red-600 text-white">
          Error: {error}
        </div>
      )}

      {/* Table container */}
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-slate-700 text-xs text-gray-200 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">ID / Status</th>
              <th scope="col" className="px-6 py-3">User Details</th>
              <th scope="col" className="px-6 py-3">Bank Account</th>
              <th scope="col" className="px-6 py-3 text-right">Grams</th>
              <th scope="col" className="px-6 py-3 text-right">Amount (₹)</th>
              <th scope="col" className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No payouts are currently awaiting manual completion.</td>
              </tr>
            ) : (
              requests.map(req => {
                // Convert potential strings to numbers for formatting
                const grams = parseFloat(req.grams as string);
                const amountInr = parseFloat(req.amount_inr as string);

                return (
                  <tr key={req.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-150">
                    {/* ID / Status */}
                    <td className="px-6 py-4 font-medium">
                        <div>{req.id}</div>
                        {/* We pass the normalized status to formatStatus */}
                        {formatStatus(req.status as string)} 
                    </td>
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{req.name || 'N/A'}</div>
                      <div className="text-sm text-gray-400">{req.email || 'N/A'}</div>
                    </td>
                    {/* Bank Info */}
                    <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-300">{req.bank_account_name || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{req.bank_account_number || 'N/A'} ({req.bank_ifsc_code || 'N/A'})</div>
                    </td>
                    {/* Grams */}
                    <td className="px-6 py-4 text-right">{isNaN(grams) ? 'Error' : grams.toFixed(4)} g</td>
                    {/* Amount */}
                    <td className="px-6 py-4 text-right">{formatCurrency(amountInr)}</td>
                    {/* Action Button */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                          onClick={() => handleComplete(req.id, amountInr)}
                          disabled={processingId === req.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:opacity-50"
                      >
                          {processingId === req.id ? 'Completing...' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutsAwaitingCompletionPage;
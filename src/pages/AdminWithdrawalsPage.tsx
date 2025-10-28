import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; // Use our API helper
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'; // Import icons for status

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
  bank_account_name: string | null;      // From join
  bank_account_number: string | null;    // From join
  bank_ifsc_code: string | null;         // From join
  // Status only needs to handle 'pending', 'completed', 'rejected', 'failed'
  status: 'pending' | 'completed' | 'rejected' | 'failed' | string | null | undefined; 
}

const AdminWithdrawalsPage: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Function to fetch requests (only fetching 'pending')
  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch only requests awaiting initial approval
      const res = await api.get('/admin/withdrawals/pending'); 
      setRequests(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending withdrawal requests.');
      console.error("Fetch pending withdrawals error:", err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]); 

  // --- Handler Functions ---

  // Handler for Single-Phase Approval: Prompts for Order ID, marks COMPLETED
  const handleApprove = async (req: WithdrawalRequest) => {
    if (processingId) return;
    
    const amount = parseFloat(req.amount_inr as string);
    
    // Prompt for the required Order ID / Reference ID
    const refId = prompt(`Confirm payout of ₹${amount.toFixed(2)} to ${req.name}. Enter **UTR/Cashfree Order ID** to complete:`);
    if (!refId || refId.trim() === '') {
      alert("Approval cancelled. Reference ID is required to mark as completed.");
      return;
    }

    setProcessingId(req.id);
    try {
      // Calls backend to check balance/KYC, update status to 'completed', decrease balance, and set cashfree_order_id
      const res = await api.post(`/admin/withdrawals/${req.id}/approve`, { referenceId: refId.trim() });
      alert(`Request ${req.id} COMPLETED! Message: ${res.data.message}`);
      fetchPendingRequests(); // Refresh the list
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to approve request ${req.id}.`;
      alert(`Error: ${errMsg}`);
      setError(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  // Handler for Rejection (Moves status to 'rejected') - (Unchanged)
  const handleReject = async (id: number) => {
    if (processingId) return;

    // Use a simple prompt to get the rejection reason
    const reason = prompt(`Please provide a reason for rejecting request ${id}:`);
    if (!reason || reason.trim() === '') {
      alert("Rejection cancelled. A reason is required.");
      return; 
    }

    setProcessingId(id);
    setError(null);
    try {
      // Calls rejection endpoint
      await api.post(`/admin/withdrawals/${id}/reject`, { reason: reason.trim() });
      alert(`Request ${id} rejected successfully!`);
      fetchPendingRequests(); // Refresh list
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to reject request ${id}.`;
      alert(`Error rejecting request ${id}: ${errMsg}`);
      setError(`Error rejecting request ${id}: ${errMsg}`);
    } finally {
      setProcessingId(null); // Reset processing state
    }
  };

  // --- Render Helpers ---
  
  // Safely format status strings (handling undefined/null)
  const formatStatus = (status: string | undefined | null) => { 
      if (!status) {
          return (
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-500 text-white">
                  N/A
              </span>
          );
      }
      
      const statusClasses: { [key: string]: string } = {
          pending: 'bg-yellow-700 text-yellow-100',
          completed: 'bg-green-600 text-green-100',
          rejected: 'bg-red-600 text-red-100',
          failed: 'bg-red-600 text-red-100',
      };
      // Normalize status string 
      const statusKey = status.toLowerCase().replace(/_/g, '');
      const displayStatus = status.toUpperCase().replace('_', ' ');

      return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[statusKey] || 'bg-gray-500 text-white'}`}>
              {displayStatus}
          </span>
      );
  };

  // Logic for displaying action buttons based on status
  const getActionButtons = (req: WithdrawalRequest) => {
    const isProcessing = processingId === req.id;
    
    // FIX: Default status to 'pending' if null/undefined
    const currentStatus = (req.status || 'pending') as string;

    if (currentStatus === 'pending') {
        // Awaiting Admin approval/completion
        return (
            <>
                <button
                    onClick={() => handleApprove(req)} // Pass the whole request now
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2 disabled:opacity-50"
                >
                    {isProcessing ? 'Completing...' : 'Approve & Complete'}
                </button>
                <button
                    onClick={() => handleReject(req.id)}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded disabled:opacity-50"
                >
                    Reject
                </button>
            </>
        );
    } 
    
    // For completed, rejected, failed, return the formatted status text
    return formatStatus(currentStatus);
  };

  if (loading) return <p className="text-gray-400 text-center p-6">Loading pending requests...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Manage Withdrawal Requests</h1>

      {/* Display general fetch error if it occurred */}
      {error && !loading && (
        <div className="mb-4 p-4 rounded-md text-sm bg-red-800 border border-red-600 text-white">
          Error: {error}
        </div>
      )}

      {/* Table container */}
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          {/* Table Head */}
          <thead className="bg-slate-700 text-xs text-gray-200 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">ID / Status</th>
              <th scope="col" className="px-6 py-3">User Details</th>
              <th scope="col" className="px-6 py-3">Bank Details</th>
              <th scope="col" className="px-6 py-3 text-right">Grams</th>
              <th scope="col" className="px-6 py-3 text-right">Amount (₹)</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {/* Show message if no requests */}
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No pending withdrawal requests found.</td>
              </tr>
            ) : (
              // Map through pending requests
              requests.map(req => {
                // Convert potential strings to numbers for formatting
                const grams = parseFloat(req.grams as string);
                const amountInr = parseFloat(req.amount_inr as string);

                return (
                  <tr key={req.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-150">
                    {/* ID / Status */}
                    <td className="px-6 py-4 font-medium">
                        <div>{req.id}</div>
                        {formatStatus(req.status)}
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
                    <td className="px-6 py-4 text-right">₹{isNaN(amountInr) ? 'Error' : amountInr.toFixed(2)}</td>
                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {getActionButtons(req)}
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

export default AdminWithdrawalsPage;
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  // Keep track if verification has ever succeeded
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      setStatus('error');
      setMessage('Invalid payment link. No order ID found.');
      return;
    }

    // Skip if already successfully verified
    if (verificationComplete) {
        console.log("Verification process already completed successfully.");
        return;
    }

    const verifyPayment = async () => {
      // Don't reset to loading if already succeeded
      if (!verificationComplete) {
         setStatus('loading');
         setMessage('Verifying your payment...');
      }

      try {
        console.log("Calling /verify-payment for order:", order_id);
        const res = await api.post('/buy/verify-payment', { order_id });
        console.log("Verification API response:", res.data);

        // --- Treat *any* 2xx response as success ---
        setStatus('success');
        // Use the specific message from backend, or a default
        setMessage(res.data.message || 'Payment Verified Successfully!');
        setVerificationComplete(true); // Mark verification as done
        // --- End Success Handling ---

      } catch (err: any) {
        console.error("Verification API error:", err.response?.data || err.message);
        // --- Only set error state if verification hasn't completed yet ---
        if (!verificationComplete) {
            setStatus('error');
            // Prioritize backend error message
            const backendMsg = err.response?.data?.message;
            setMessage(backendMsg || 'Payment verification failed.');
        } else {
             // If it already succeeded, log the error from the double call but don't change UI
             console.log("Ignoring subsequent error as verification already completed:", err.response?.data || err.message);
        }
        // --- End Error Handling ---
      }
    };

    verifyPayment();

  // Add verificationComplete to dependencies to prevent re-run after success
  }, [searchParams, verificationComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-gray-200 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        {/* Render based on status */}
        {status === 'loading' && (
          <h2 className="text-2xl font-bold text-yellow-500 mb-4 animate-pulse">Verifying...</h2>
        )}
        {status === 'success' && (
          <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
        )}
        {status === 'error' && (
          // Use a more accurate title if it's an error state
          <h2 className="text-2xl font-bold text-red-500 mb-4">Payment Verification Issue</h2>
        )}

        <p className="text-gray-300 mb-6">{message}</p>

        {/* Show link only after loading finishes */}
        {status !== 'loading' && (
          <Link
            to="/dashboard/portfolio" // Link to portfolio
            className="w-full inline-block py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md"
          >
            Go to My Portfolio
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
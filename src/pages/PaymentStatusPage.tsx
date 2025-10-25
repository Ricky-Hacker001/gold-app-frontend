import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      setStatus('error');
      setMessage('Invalid payment link. No order ID found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.post('/buy/verify-payment', { order_id });
        setStatus('success');
        setMessage(res.data.message || 'Payment Successful!');
      } catch (err: any) {
        setStatus('error');
        const msg = err.response?.data?.message || 'Payment verification failed.';
        setMessage(msg);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-gray-200 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        {status === 'loading' && (
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">Verifying...</h2>
        )}
        {status === 'success' && (
          <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
        )}
        {status === 'error' && (
          <h2 className="text-2xl font-bold text-red-500 mb-4">Payment Failed</h2>
        )}
        
        <p className="text-gray-300 mb-6">{message}</p>

        {status !== 'loading' && (
          <Link
            to="/dashboard/portfolio"
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
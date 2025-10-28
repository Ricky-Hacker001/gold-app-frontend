import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Define the interface for the data this modal will receive
interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalGrams: number;
  currentValue: number;
  profit: number;
  totalInvested: number;

  // KYC/Bank details
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  pan_card_number: string | null;
  aadhaar_card_number: string | null;
  
  // Base properties
  role: 'user' | 'admin';
  created_at: string;
}

interface UserDetailsModalProps {
  user: UserDetails;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  
  // Helper to check if KYC is incomplete
  const isKycIncomplete = !user.pan_card_number || !user.aadhaar_card_number;
  // Helper to check if Bank is incomplete
  const isBankIncomplete = !user.bank_account_name || !user.bank_account_number || !user.bank_ifsc_code;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-yellow-500">User Details: {user.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* --- Grid Content --- */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          
          {/* Column 1: Basic Info */}
          <div>
            <h3 className="font-semibold text-gray-300 mb-2 border-b border-slate-700">Account</h3>
            <p><strong className="text-gray-400">User ID:</strong> {user.id}</p>
            <p><strong className="text-gray-400">Email:</strong> {user.email}</p>
            <p><strong className="text-gray-400">Phone:</strong> {user.phone}</p>
            <p><strong className="text-gray-400">Role:</strong> {user.role.toUpperCase()}</p>
            <p><strong className="text-gray-400">Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          {/* Column 2: Portfolio Summary */}
          <div>
            <h3 className="font-semibold text-gray-300 mb-2 border-b border-slate-700">Portfolio Value</h3>
            <p className="text-lg"><strong className="text-gray-400">Gold Held:</strong> <span className="text-yellow-500">{user.totalGrams.toFixed(4)} g</span></p>
            <p className="text-lg"><strong className="text-gray-400">Market Value:</strong> <span className="text-white">₹{user.currentValue.toFixed(2)}</span></p>
            <p className="text-lg"><strong className="text-gray-400">Cost Basis:</strong> <span className="text-gray-300">₹{user.totalInvested.toFixed(2)}</span></p>
            <p className="text-lg"><strong className="text-gray-400">P/L:</strong> <span className={user.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
              {user.profit >= 0 ? '+' : ''}₹{user.profit.toFixed(2)}
            </span></p>
          </div>
        </div>

        <hr className="border-slate-700 my-4" />

        {/* --- KYC and Bank Details --- */}
        <h3 className="font-semibold text-gray-300 mb-3 border-b border-slate-700">Bank & KYC Details</h3>

        {/* Status Alert */}
        {isKycIncomplete && (
             <div className="p-2 bg-red-900 border border-red-700 text-sm mb-3 rounded">
                ⚠️ **KYC Warning:** PAN or Aadhaar is missing for this user.
             </div>
        )}
        {isBankIncomplete && (
             <div className="p-2 bg-red-900 border border-red-700 text-sm mb-3 rounded">
                ⚠️ **Bank Warning:** Bank Account details are incomplete.
             </div>
        )}


        <div className="grid grid-cols-2 gap-4 text-sm">
            {/* KYC Details */}
            <div>
                <p><strong className="text-gray-400">PAN Number:</strong> {user.pan_card_number || 'N/A'}</p>
                <p><strong className="text-gray-400">Aadhaar Number:</strong> {user.aadhaar_card_number || 'N/A'}</p>
            </div>
            {/* Bank Details */}
            <div>
                <p><strong className="text-gray-400">Acc. Name:</strong> {user.bank_account_name || 'N/A'}</p>
                <p><strong className="text-gray-400">Acc. Number:</strong> {user.bank_account_number || 'N/A'}</p>
                <p><strong className="text-gray-400">IFSC Code:</strong> {user.bank_ifsc_code || 'N/A'}</p>
            </div>
        </div>

        {/* --- Action/Close Button --- */}
        <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
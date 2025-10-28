import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; 

// Interface for the profile data received from the API
interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    created_at: string;
    bank_account_name: string | null;
    bank_account_number: string | null;
    bank_ifsc_code: string | null;
    pan_card_number: string | null;       // <-- NEW
    aadhaar_card_number: string | null;    // <-- NEW
}

const SettingsPage: React.FC = () => {
    // --- State for Profile Data ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    // --- State for Bank Details Form (Combined KYC/Bank) ---
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [panNumber, setPanNumber] = useState('');           // <-- NEW
    const [aadhaarNumber, setAadhaarNumber] = useState('');   // <-- NEW

    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Fetch Profile Data ---
    const fetchProfile = useCallback(async () => {
        try {
            setLoadingProfile(true);
            setProfileError(null);
            const res = await api.get('/profile/me');
            const data: UserProfile = res.data;
            setProfile(data);
            // Pre-fill forms
            setAccountName(data.bank_account_name || '');
            setAccountNumber(data.bank_account_number || '');
            setIfscCode(data.bank_ifsc_code || '');
            setPanNumber(data.pan_card_number || '');       // <-- Pre-fill PAN
            setAadhaarNumber(data.aadhaar_card_number || ''); // <-- Pre-fill Aadhaar
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Failed to load profile data.';
            setProfileError(errMsg);
            console.error("Profile fetch error:", err);
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // --- Handle Combined Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormMessage(null);
        setIsSubmitting(true);

        // Required Validation (Bank details are mandatory for withdrawal workflow)
        if (!accountName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
            setFormMessage({ type: 'error', text: 'Account name, number, and IFSC code are required.' });
            setIsSubmitting(false);
            return;
        }

        try {
            console.log("Submitting profile update...");
            const res = await api.put('/profile/update', { // <-- Use updated route
                accountName: accountName.trim(),
                accountNumber: accountNumber.trim(),
                ifscCode: ifscCode.trim().toUpperCase(),
                panNumber: panNumber.trim(),
                aadhaarNumber: aadhaarNumber.trim(),
            });
            console.log("Profile update response:", res.data);
            setFormMessage({ type: 'success', text: res.data.message || 'Profile details updated!' });
            // Re-fetch profile data to get latest details (like server-validated data)
            setTimeout(() => fetchProfile(), 100); 
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Failed to update profile.';
            setFormMessage({ type: 'error', text: errMsg });
            console.error("Profile update error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Render Logic ---
    if (loadingProfile) return <p className="text-gray-400">Loading profile...</p>;
    if (profileError) return <p className="text-red-500">{profileError}</p>;
    if (!profile) return <p className="text-gray-400">Profile data not available.</p>; 

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Profile & Settings</h1>

            {/* --- Profile Information Card --- */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8 max-w-xl">
                <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-600 pb-2">Your Information</h2>
                <div className="space-y-3 text-gray-300">
                    <p><strong className="text-gray-400">Name:</strong> {profile.name}</p>
                    <p><strong className="text-gray-400">Email:</strong> {profile.email}</p>
                    <p><strong className="text-gray-400">Phone:</strong> {profile.phone}</p>
                    <p><strong className="text-gray-400">Role:</strong> {profile.role.toUpperCase()}</p>
                </div>
            </div>

            {/* --- Combined KYC & Bank Details Form --- */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-xl">
                <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-600 pb-2">Withdrawal & KYC Details</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Bank details are required for withdrawals. PAN/Aadhaar are required for regulatory compliance.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- KYC FIELDS --- */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* PAN Card Number */}
                        <div>
                            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-300 mb-1">
                                PAN Card Number
                            </label>
                            <input
                                type="text"
                                id="panNumber"
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
                                value={panNumber}
                                onChange={(e) => setPanNumber(e.target.value.toUpperCase())} // Force uppercase
                                disabled={isSubmitting}
                                maxLength={10} // Standard PAN length
                            />
                        </div>

                        {/* Aadhaar Card Number */}
                        <div>
                            <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-300 mb-1">
                                Aadhaar Card Number
                            </label>
                            <input
                                type="text"
                                id="aadhaarNumber"
                                inputMode="numeric"
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={aadhaarNumber}
                                onChange={(e) => setAadhaarNumber(e.target.value)}
                                disabled={isSubmitting}
                                maxLength={12} // Standard Aadhaar length
                            />
                        </div>
                    </div>
                    
                    {/* --- BANK DETAILS --- */}
                    <hr className="border-slate-700" />
                    <h3 className="text-md font-medium text-gray-400">Bank Account</h3>
                    
                    {/* Account Holder Name */}
                    <div>
                        <label htmlFor="accountName" className="block text-sm font-medium text-gray-300 mb-1">
                            Account Holder Name *
                        </label>
                        <input
                            type="text"
                            id="accountName"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Account Number */}
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            id="accountNumber"
                            inputMode="numeric"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* IFSC Code */}
                    <div>
                        <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-300 mb-1">
                            IFSC Code *
                        </label>
                        <input
                            type="text"
                            id="ifscCode"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                            required
                            disabled={isSubmitting}
                            maxLength={11}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md transition-opacity disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save All Details'}
                    </button>

                    {/* Message Display */}
                    {formMessage && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${
                        formMessage.type === 'success'
                            ? 'bg-green-800 border border-green-600 text-white'
                            : 'bg-red-800 border border-red-600 text-white'
                        }`}>
                            {formMessage.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
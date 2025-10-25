import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- Import jwt-decode

// Define an interface for the shape of the decoded token
interface DecodedToken {
  userId: number;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null); // For login errors
  const navigate = useNavigate();

  const { emailOrPhone, password } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      // --- API Call ---
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { emailOrPhone, password }
      );

      // --- SUCCESS ---
      const { token } = res.data;
      localStorage.setItem('token', token); // Save token

      // --- NEW: Decode token and redirect based on role ---
      const decodedToken = jwtDecode<DecodedToken>(token);

      if (decodedToken.role === 'admin') {
        navigate('/admin/dashboard'); // Send admins here
      } else {
        navigate('/dashboard'); // Send regular users here
      }

    } catch (err: any) {
      // --- ERROR ---
      console.error(err);
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold text-center text-white">
        Welcome Back
      </h2>

      {/* --- Error Message Display --- */}
      {error && (
        <div className="p-3 bg-red-800 border border-red-600 text-white rounded-md text-sm">
          {error}
        </div>
      )}

      {/* --- Form Fields --- */}
      <div>
        <label
          htmlFor="emailOrPhone"
          className="block text-sm font-medium text-gray-300"
        >
          Email or Phone Number
        </label>
        <input
          type="text"
          id="emailOrPhone"
          name="emailOrPhone"
          value={emailOrPhone}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-500 transition-colors"
      >
        Login
      </button>
    </form>
  );
};

export default Login;
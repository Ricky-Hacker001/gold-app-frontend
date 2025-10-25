import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  // --- ADD THIS FUNCTION ---
  const showLogin = () => {
    setIsLogin(true);
  };
  // --- END ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-gray-200 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        
        {/* --- UPDATE THIS LINE --- */}
        {isLogin ? <Login /> : <Register onRegistrationSuccess={showLogin} />}
        {/* --- END --- */}

        <button
          onClick={toggleForm}
          className="w-full mt-6 text-sm text-center text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          {isLogin
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
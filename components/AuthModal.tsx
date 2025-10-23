import React, { useState } from 'react';
import { supabase } from '../App'; // Import the Supabase client

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        // --- SIGN UP ---
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Success! Please check your email for a confirmation link.');
      } else {
        // --- SIGN IN ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // On successful login, the onAuthStateChange listener in App.tsx will handle the session update and this modal will be closed.
        onClose();
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-200 border-4 border-black p-6 sm:p-8 w-full max-w-sm relative text-black">
        <button onClick={onClose} className="absolute -top-2 -right-2 bg-red-500 border-2 border-black w-8 h-8 text-white font-bold text-xl hover:bg-red-600 flex items-center justify-center z-10">
          <span className="mb-0.5">X</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center" style={{ textShadow: '2px 2px #fff' }}>
          {isSignUp ? 'Create Admin Account' : 'Admin Login'}
        </h2>
        
        <form onSubmit={handleAuthAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className="text-red-700 text-sm text-center font-bold">{error}</p>}
          {message && <p className="text-green-700 text-sm text-center font-bold">{message}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5 disabled:bg-gray-500 disabled:border-b-2 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-700 hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

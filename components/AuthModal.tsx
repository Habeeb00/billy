
import React, { useState } from 'react';
import { supabase } from '../App'; // Import the Supabase client

interface AuthModalProps {
  onClose: () => void;
}

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.444-11.28-8.161l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.986,36.938,44,31.25,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export function AuthModal({ onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    // Use redirect-based flow which is more reliable and avoids popup blockers.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, the browser will redirect away, so no need to set loading to false.
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-200 border-4 border-black p-6 sm:p-8 w-full max-w-sm relative text-black">
        <button onClick={onClose} className="absolute -top-2 -right-2 bg-red-500 border-2 border-black w-8 h-8 text-white font-bold text-xl hover:bg-red-600 flex items-center justify-center z-10">
          <span className="mb-0.5">X</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center" style={{ textShadow: '2px 2px #fff' }}>
          Login
        </h2>
        
        <div className="space-y-4">
          {error && <p className="text-red-700 text-sm text-center font-bold">{error}</p>}

          <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full px-4 py-3 bg-white text-black border-2 border-b-4 border-black hover:bg-gray-100 active:border-b-2 active:mt-0.5 disabled:bg-gray-400 disabled:border-b-2 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              style={{fontFamily: 'sans-serif'}}
          >
              <GoogleIcon className="w-6 h-6" />
              <span className="font-bold text-base">{loading ? 'Redirecting...' : 'Sign In with Google'}</span>
          </button>
        </div>
        
        <p className="text-xs text-center text-gray-600 mt-4" style={{fontFamily: 'sans-serif'}}>
          Use the designated admin Google account to manage billboard ads. You will be redirected for authentication.
        </p>
      </div>
    </div>
  );
}
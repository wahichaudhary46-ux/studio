'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Kripya apna email address dalein.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link aapke email par bhej diya gaya hai. Apna inbox (aur spam folder) check karein.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Is email address se koi account nahi mila.');
      } else {
        setError('Password reset email bhejne mein asamarth. Kripya dobara prayas karein.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white/5 p-8 rounded-[35px] border border-white/10 w-full max-w-md">
        <h1 className="text-4xl font-black text-white mb-2 text-center underline decoration-blue-500">RESET <span className="text-blue-500">PASSWORD</span></h1>
        <p className="text-gray-500 text-[10px] mb-8 text-center font-bold tracking-[3px] uppercase">Recover Your Account</p>
        
        {message && <p className="bg-green-500/10 text-green-400 text-[10px] p-3 rounded-xl text-center mb-4 font-bold border border-green-500/20">{message}</p>}
        {error && <p className="bg-red-500/10 text-red-500 text-[10px] p-3 rounded-xl text-center mb-4 font-bold border border-red-500/20">{error}</p>}
        
        {!message && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input 
              type="email" 
              placeholder="Your Registered Gmail Address" 
              required 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading} 
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-70" 
              disabled={isLoading}
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-gray-500 text-xs">Remembered it? <Link href="/login" className="text-blue-500 font-bold ml-1">Go back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}

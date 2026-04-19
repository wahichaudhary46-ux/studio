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
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-8 shadow-2xl shadow-black/30">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Enter your email to receive a reset link.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-xs text-center font-medium">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <p className="text-green-400 text-xs text-center font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="group">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your Email ID"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!message}
              className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-70"
            >
              <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl py-4 text-white font-black text-lg transition-all duration-300 group-hover:scale-[1.02]">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="text-gray-500 text-center mt-6 text-sm border-t border-white/10 pt-5">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

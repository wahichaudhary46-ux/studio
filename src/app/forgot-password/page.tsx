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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Neon grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#00ffff11_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      {/* Animated neon orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md">
        {/* Neon glow card */}
        <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,255,255,0.4)]">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className="relative p-8">
            {/* Neon Text Header */}
            <div className="text-center mb-8">
               <h1 className="text-4xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-gray-400 mt-2 text-sm font-mono">Enter your email to receive a reset link.</p>
               <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_8px_#00ffff]"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-green-400 text-xs text-center font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="Your Email ID"
                  required
                  className="w-full p-4 bg-white/5 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_#00ffff]"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !!message}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px] transition-all duration-300 hover:shadow-[0_0_20px_#00ffff] disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full rounded-xl py-4 text-white font-black text-lg tracking-wider group-hover:scale-[1.02] transition-all">
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

            <p className="text-gray-400 text-center mt-6 text-sm border-t border-cyan-500/30 pt-5 font-mono">
              Remembered your password?{' '}
              <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors hover:shadow-[0_0_6px_cyan]">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

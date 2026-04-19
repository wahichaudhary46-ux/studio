'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-indigo-500/5 to-transparent"></div>
      </div>

      <div className="relative perspective-1000 w-full max-w-md">
        <div className="relative transform-gpu transition-all duration-500 hover:rotate-y-2 hover:rotate-x-2 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[35px] blur-2xl transform translate-y-4"></div>
          
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-8 shadow-2xl shadow-black/30 transition-all duration-300 hover:shadow-blue-500/10">
            <div className="text-center mb-6">
              <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                CREATE ACCOUNT
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="group">
                <input
                  type="email"
                  placeholder="Email ID"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="group">
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl py-4 text-white font-black text-lg transition-all duration-300 group-hover:scale-[1.02]">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "SIGN UP"
                  )}
                </div>
              </button>
            </form>

            <p className="text-gray-500 text-center mt-6 text-sm border-t border-white/10 pt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-2 {
          transform: rotateY(2deg) rotateX(2deg);
        }
        .hover\\:rotate-y-2:hover {
          transform: rotateY(2deg) rotateX(2deg);
        }
      `}</style>
    </div>
  );
}

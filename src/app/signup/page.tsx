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
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // After signup, user is automatically logged in. The root page will handle
      // redirecting to /onboarding for new users.
      router.push('/'); 
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/weak-password') {
          setError("Password should be at least 6 characters.");
      }
      else {
        setError("Failed to create an account. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl shadow-black/30 hover:shadow-blue-500/5 transition-all duration-300">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent tracking-tight">
              NEXA<span className="text-blue-500">PRO</span>
            </h1>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
              <p className="text-blue-300 text-xs font-bold tracking-wider">CREATE ACCOUNT</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="group">
              <label className="block text-gray-400 text-xs font-semibold mb-1 ml-1">EMAIL ID</label>
              <input 
                type="email" 
                placeholder="student@example.com" 
                required 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                value={formData.email}
              />
            </div>

            <div className="group">
              <label className="block text-gray-400 text-xs font-semibold mb-1 ml-1">PASSWORD</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600 pr-12"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  value={formData.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.243L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="group">
              <label className="block text-gray-400 text-xs font-semibold mb-1 ml-1">CONFIRM PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                value={formData.confirmPassword}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>CREATING ACCOUNT...</span>
                </div>
              ) : (
                "SIGN UP"
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-2 decoration-blue-500/30">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

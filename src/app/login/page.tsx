'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const docSnap = await getDoc(doc(db, "students", result.user.uid));
      
      if (docSnap.exists()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Invalid Email or Password");
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-indigo-500/5 to-transparent"></div>
      </div>

      {/* 3D Card Container */}
      <div className="relative perspective-1000 w-full max-w-md">
        <div className="relative transform-gpu transition-all duration-500 hover:rotate-y-2 hover:rotate-x-2 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[35px] blur-2xl transform translate-y-4"></div>
          
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-8 shadow-2xl shadow-black/30 transition-all duration-300 hover:shadow-blue-500/10">
            
            {/* Logo + Brand */}
            <div className="text-center mb-6">
              {/* Small Logo Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_#00ffff66]">
                  <span className="text-white text-2xl font-black">N</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  NEXA
                </span>
                <span className="text-white"> </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  LIBRARY
                </span>
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_6px_#00ffff]"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            {/* Email/Password Form - Only login method */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email ID"
                    required
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-4 text-white font-black text-lg transition-all duration-300 group-hover:scale-[1.02]">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "LOGIN"
                  )}
                </div>
              </button>
            </form>

            {/* Sign Up Redirect - No Google, no Forgot Password */}
            <p className="text-gray-500 text-center mt-8 text-sm border-t border-white/10 pt-6">
              New user?{' '}
              <Link href="/signup" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors">
                Create Account
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

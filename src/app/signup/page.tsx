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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/'); // Redirect to home to check onboarding status
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
               <h1 className="text-4xl md:text-5xl font-black tracking-wider">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  CREATE
                </span>
                <span className="text-white"> </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ACCOUNT
                </span>
              </h1>
              <div className="h-[2px] w-32 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_8px_#00ffff]"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="Email ID"
                  required
                  className="w-full p-4 bg-white/5 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_#00ffff]"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  required
                  className="w-full p-4 bg-white/5 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_#00ffff]"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  className="w-full p-4 bg-white/5 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_#00ffff]"
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px] transition-all duration-300 hover:shadow-[0_0_20px_#00ffff] disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full rounded-xl py-4 text-white font-black text-lg tracking-wider group-hover:scale-[1.02] transition-all">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "CREATE ACCOUNT"}
                </div>
              </button>
            </form>

            <p className="text-gray-400 text-center mt-6 text-sm border-t border-cyan-500/30 pt-5 font-mono">
              Already a member?{' '}
              <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors hover:shadow-[0_0_6px_cyan]">
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

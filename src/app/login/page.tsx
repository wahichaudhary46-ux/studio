'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Convert phone number to a consistent fake email
const phoneToEmail = (phone: string) => `${phone.replace(/\D/g, '')}@nexa.local`;

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!phone.trim()) {
      setError('Please enter your phone number');
      setIsLoading(false);
      return;
    }

    const fakeEmail = phoneToEmail(phone);

    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const docSnap = await getDoc(doc(db, "students", result.user.uid));
      
      if (docSnap.exists() && docSnap.data().name) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("No account found with this phone number.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else {
        setError("Invalid phone number or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects (same as before) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative perspective-1000 w-full max-w-md">
        <div className="relative transform-gpu transition-all duration-500 hover:rotate-y-2 hover:rotate-x-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[35px] blur-2xl transform translate-y-4"></div>
          
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-8 shadow-2xl">
            {/* Logo + Brand */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_#00ffff66]">
                  <span className="text-white text-2xl font-black">N</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">NEXA</span>
                <span className="text-white"> </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">LIBRARY</span>
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_6px_#00ffff]"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-xs text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <input
                type="tel"
                placeholder="Phone No"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-white font-black text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-70"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : "LOGIN"}
              </button>
            </form>

            <p className="text-gray-500 text-center mt-8 text-sm border-t border-white/10 pt-6">
              New user?{' '}
              <Link href="/signup" className="text-cyan-500 font-bold hover:text-cyan-400">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-2 { transform: rotateY(2deg) rotateX(2deg); }
        .hover\\:rotate-y-2:hover { transform: rotateY(2deg) rotateX(2deg); }
      `}</style>
    </div>
  );
}

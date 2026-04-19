'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const docSnap = await getDoc(doc(db, "students", result.user.uid));
      router.push(docSnap.exists() ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') setError("No account found.");
      else if (err.code === 'auth/wrong-password') setError("Incorrect password.");
      else if (err.code === 'auth/invalid-email') setError("Invalid email address.");
      else setError("Invalid Email or Password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || '',
          profilePic: user.photoURL || '',
          createdAt: serverTimestamp(),
        }, { merge: true });
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => router.push('/forgot-password');

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
              <h1 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  NEXA
                </span>
                <span className="text-white"> </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  LIBRARY
                </span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_8px_#00ffff]"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="Password"
                  required
                  className="w-full p-4 bg-white/5 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_#00ffff]"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px] transition-all duration-300 hover:shadow-[0_0_20px_#00ffff] disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full rounded-xl py-4 text-white font-black text-lg tracking-wider group-hover:scale-[1.02] transition-all">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "LOGIN"}
                </div>
              </button>
            </form>

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-cyan-500/30"></div>
              <span className="mx-4 text-cyan-400 text-sm font-mono">OR</span>
              <div className="flex-grow border-t border-cyan-500/30"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl py-3 px-4 transition-all duration-300 group disabled:opacity-70 hover:shadow-[0_0_12px_#00ffff]"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-white font-medium">Continue with Google</span>
                </>
              )}
            </button>
            
            <p className="text-gray-400 text-center mt-6 text-sm border-t border-cyan-500/30 pt-5 font-mono">
              New user?{' '}
              <Link href="/signup" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors hover:shadow-[0_0_6px_cyan]">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

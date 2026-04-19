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

  // Email/Password Login
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

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // If new user, create a minimal Firestore entry
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          profilePic: user.photoURL || null,
          createdAt: serverTimestamp(),
        }, { merge: true });
        // Redirect to onboarding for new users
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                MEMBER LOGIN
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email ID"
                    required
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-70"
              >
                <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl py-4 text-white font-black text-lg transition-all duration-300 group-hover:scale-[1.02]">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "LOGIN"
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl py-3 px-4 transition-all duration-300 group disabled:opacity-70"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-white font-medium">Continue with Google</span>
                </>
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                Forgot Password? <span className="text-blue-500">Click to reset</span>
              </button>
            </div>

            {/* Sign Up Redirect */}
            <p className="text-gray-500 text-center mt-6 text-sm border-t border-white/10 pt-5">
              New user?{' '}
              <Link href="/signup" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
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

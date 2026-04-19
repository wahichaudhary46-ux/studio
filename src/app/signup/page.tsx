'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const phoneToEmail = (phone: string) => `${phone.replace(/\D/g, '')}@nexa.local`;

export default function SignUpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setIsLoading(true);
    const fakeEmail = phoneToEmail(phone);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;
      // Store phone number in Firestore for reference
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        email: fakeEmail,
        phone: phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      router.push('/onboarding');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert("यह नंबर पहले से रजिस्टर है! कृपया लॉगिन करें।");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_#00ffff66]">
              <span className="text-white text-2xl font-black">N</span>
            </div>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CREATE ACCOUNT</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="tel"
            placeholder="Phone Number (e.g., +919876543210)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-70"
          >
            {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>
        
        <p className="text-gray-500 text-center mt-6 text-sm">
          Already have an account? <Link href="/login" className="text-cyan-500 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}

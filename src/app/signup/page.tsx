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
      setError("Password mel nahi khate. Kripya dobara check karein.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password kam se kam 6 akshar ka hona chahiye.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Is email se account pehle se hai.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Kripya ek vaidh email dalein.");
      } else {
        setError("Account banane mein samasya aa rahi hai. Kripya baad mein prayas karein.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white/5 p-8 rounded-[35px] border border-white/10 w-full max-w-md">
        <h1 className="text-4xl font-black text-white mb-2 text-center underline decoration-blue-500">CREATE <span className="text-blue-500">ACCOUNT</span></h1>
        <p className="text-gray-500 text-[10px] mb-8 text-center font-bold tracking-[3px] uppercase">New Student Registration</p>
        
        {error && <p className="bg-red-500/10 text-red-500 text-[10px] p-3 rounded-xl text-center mb-4 font-bold border border-red-500/20">{error}</p>}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="Gmail Address" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={loading} />
          <input type="password" placeholder="Permanent Password (min. 6 char)" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, password: e.target.value})} disabled={loading} />
          <input type="password" placeholder="Confirm Password" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} disabled={loading} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-70" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-gray-500 text-xs">Already a member? <Link href="/login" className="text-blue-500 font-bold ml-1">Login Now</Link></p>
        </div>
      </div>
    </div>
  );
}

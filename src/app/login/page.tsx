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
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const docSnap = await getDoc(doc(db, "students", result.user.uid));
      
      // अगर डेटा मौजूद है तो सीधा डैशबोर्ड, वरना ऑनबोर्डिंग
      if (docSnap.exists()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError("Galat Email ya Password! Kripya sahi details dalein.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white/5 p-8 rounded-[35px] border border-white/10 w-full max-w-md">
        <h1 className="text-4xl font-black text-white mb-2 text-center underline decoration-blue-500">NEXA <span className="text-blue-500">PRO</span></h1>
        <p className="text-gray-500 text-[10px] mb-8 text-center font-bold tracking-[3px] uppercase">Member Access Only</p>
        
        {error && <p className="bg-red-500/10 text-red-500 text-[10px] p-3 rounded-xl text-center mb-4 font-bold border border-red-500/20">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Gmail Address" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={loading} />
          <input type="password" placeholder="Permanent Password" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, password: e.target.value})} disabled={loading} />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 font-bold">Forgot Password?</Link>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-70" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-gray-500 text-xs">New Student? <Link href="/signup" className="text-blue-500 font-bold ml-1">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}

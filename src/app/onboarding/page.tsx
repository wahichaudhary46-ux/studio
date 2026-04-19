'use client';

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { completeOnboardingAction } from "@/actions/user.actions";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const initialFormData = {
  name: "",
  phone: "",
  profilePic: null as string | null,
  dob: "",
  gender: "",
  admissionNumber: "1", // hardcoded
  bio: "",
  class: "",
  exam: "",
  stream: "",
  city: "",
  state: "",
  country: "",
  lastProfileUpdate: null as number | null,
};

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState(initialFormData);

  // Fetch existing data from Firestore or LocalStorage on mount
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const saved = localStorage.getItem(`onboardingData_${user.uid}`);
        let existingData: Partial<typeof initialFormData> = {};
        
        const userDocRef = doc(db, 'students', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (saved) {
          existingData = JSON.parse(saved);
        } else if (docSnap.exists()) {
            const dbData = docSnap.data();
            existingData = { 
              name: dbData.name || '',
              phone: dbData.phone || '',
              profilePic: dbData.profilePic || null,
            };
        }
        setFormData(prev => ({...prev, ...existingData, phone: docSnap.data()?.phone || prev.phone, email: user.email}));
      };
      fetchData();
    }
  }, [user]);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`onboardingData_${user.uid}`, JSON.stringify(formData));
    }
  }, [formData, user]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


  const updateField = (field: keyof typeof initialFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const canUpdateNamePic = () => {
    if (!formData.lastProfileUpdate) return true;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - formData.lastProfileUpdate > oneYear;
  };

  const handleNamePicChange = (field: 'name' | 'profilePic', value: any) => {
    if (!canUpdateNamePic() && formData.name !== "" && field === 'name') {
      toast({ variant: "destructive", title: "Update Restricted", description: "Name and profile picture can only be changed once a year. Contact admin for help."});
      return;
    }
     if (!canUpdateNamePic() && formData.profilePic && field === 'profilePic') {
      toast({ variant: "destructive", title: "Update Restricted", description: "Name and profile picture can only be changed once a year. Contact admin for help."});
      return;
    }
    updateField(field, value);
    if ((field === "name" && value) || (field === "profilePic" && value)) {
        updateField("lastProfileUpdate", Date.now());
    }
  };
  
  const getExamOptions = () => {
    const mapping: { [key: string]: string[] } = {
      "9": ["School Exam", "NTSE", "Olympiad"],
      "10": ["Board Exam", "NTSE", "Olympiad"],
      "11": ["JEE", "NEET", "CBSE", "State Board"],
      "12": ["JEE", "NEET", "CBSE", "State Board"],
      "Competitive": ["JEE", "NEET", "CLAT", "CUET"],
    };
    return mapping[formData.class] || [];
  };

  const handleSubmit = () => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }
    const mandatory = ["name", "dob", "gender", "bio", "class", "exam", "stream", "city", "state", "country", "phone"];
    for (let field of mandatory) {
      if (!formData[field as keyof typeof formData]) {
        toast({ variant: "destructive", title: "Missing Information", description: `Please fill out the ${field} field.` });
        return;
      }
    }
    
    const { admissionNumber, ...payload } = { ...formData, uid: user.uid, email: user.email! };
    startTransition(async () => {
        const result = await completeOnboardingAction(payload);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
          toast({ title: 'Success', description: 'Onboarding completed!' });
          localStorage.removeItem(`onboardingData_${user.uid}`);
          router.push('/dashboard');
        }
    });
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  const inputStyles = "w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-[35px] p-6 sm:p-8 shadow-2xl w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-gray-400">Fill in the details below to finalize your account.</p>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-4 rounded-full shadow-[0_0_6px_#00ffff]"></div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-cyan-500/50">
                <AvatarImage src={formData.profilePic || undefined} alt={formData.name} />
                <AvatarFallback className="bg-white/10 text-cyan-400 text-2xl font-bold">
                  {formData.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Input id="profilePic" type="file" accept="image/*" onChange={(e) => handleNamePicChange("profilePic", e.target.files?.[0]?.name || null)} disabled={!canUpdateNamePic() && !!formData.profilePic} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-300">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleNamePicChange("name", e.target.value)} disabled={!canUpdateNamePic() && formData.name !== ""} className={inputStyles} />
              {!canUpdateNamePic() && formData.name && <p className="text-xs text-red-400 mt-1">Name can be changed only once a year.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Phone Number</Label>
              <Input value={formData.phone} readOnly className={`${inputStyles} cursor-not-allowed bg-white/10`} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">Email (for authentication)</Label>
              <Input value={user.email || ""} readOnly className={`${inputStyles} cursor-not-allowed bg-white/10`} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-semibold text-gray-300">Date of Birth *</Label>
              <Input id="dob" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-300">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger id="gender" className={inputStyles}><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-gray-300">Bio *</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} maxLength={150} placeholder="Tell us a bit about yourself" className={`${inputStyles} min-h-[100px]`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-semibold text-gray-300">Class *</Label>
              <Select value={formData.class} onValueChange={(value) => { updateField("class", value); updateField("exam", ""); }}>
                <SelectTrigger id="class" className={inputStyles}><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent><SelectItem value="9">9th</SelectItem><SelectItem value="10">10th</SelectItem><SelectItem value="11">11th</SelectItem><SelectItem value="12">12th</SelectItem><SelectItem value="Competitive">Competitive</SelectItem></SelectContent>
              </Select>
            </div>
            {formData.class && (
            <div className="space-y-2">
              <Label htmlFor="exam" className="text-sm font-semibold text-gray-300">Exam *</Label>
              <Select value={formData.exam} onValueChange={(value) => updateField("exam", value)}>
                <SelectTrigger id="exam" className={inputStyles}><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>{getExamOptions().map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="stream" className="text-sm font-semibold text-gray-300">Stream *</Label>
              <Select value={formData.stream} onValueChange={(value) => updateField("stream", value)}>
                <SelectTrigger id="stream" className={inputStyles}><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent><SelectItem value="Science">Science</SelectItem><SelectItem value="Commerce">Commerce</SelectItem><SelectItem value="Arts">Arts</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold text-gray-300">City *</Label>
              <Input id="city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-semibold text-gray-300">State *</Label>
              <Input id="state" value={formData.state} onChange={(e) => updateField("state", e.target.value)} className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold text-gray-300">Country *</Label>
              <Input id="country" value={formData.country} onChange={(e) => updateField("country", e.target.value)} className={inputStyles} />
            </div>
          </div>
        </div>

        <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-70 text-lg"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Onboarding"
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}

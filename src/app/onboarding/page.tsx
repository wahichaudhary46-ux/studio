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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const initialFormData = {
  name: "",
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
        
        if (saved) {
          existingData = JSON.parse(saved);
        } else {
          const userDocRef = doc(db, 'students', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const dbData = docSnap.data();
            existingData = { 
              name: dbData.name || '',
              profilePic: dbData.profilePic || null,
            };
          }
        }
        setFormData(prev => ({...prev, ...existingData}));
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
    const mandatory = ["name", "dob", "gender", "bio", "class", "exam", "stream", "city", "state", "country"];
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
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Fill in the details below to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {formData.profilePic && (
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.profilePic} alt={formData.name} />
                <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleNamePicChange("name", e.target.value)} disabled={!canUpdateNamePic() && formData.name !== ""} />
              {!canUpdateNamePic() && formData.name && <p className="text-xs text-destructive">Name can be changed only after 1 year.</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profilePic">Update Profile Picture</Label>
            <Input id="profilePic" type="file" accept="image/*" onChange={(e) => handleNamePicChange("profilePic", e.target.files?.[0]?.name || null)} disabled={!canUpdateNamePic() && !!formData.profilePic} />
             {formData.profilePic && typeof formData.profilePic === 'string' && !formData.profilePic.startsWith('http') && <p className="text-sm text-muted-foreground">Current file: {formData.profilePic}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ""} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input id="dob" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
              <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Admission Number</Label>
            <Input value={formData.admissionNumber} readOnly className="bg-muted" placeholder="Will be assigned by admin"/>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} maxLength={150} placeholder="Tell us a bit about yourself" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <Select value={formData.class} onValueChange={(value) => { updateField("class", value); updateField("exam", ""); }}>
              <SelectTrigger id="class"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9th</SelectItem>
                <SelectItem value="10">10th</SelectItem>
                <SelectItem value="11">11th</SelectItem>
                <SelectItem value="12">12th</SelectItem>
                <SelectItem value="Competitive">Competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.class && (
            <div className="space-y-2">
              <Label htmlFor="exam">Exam *</Label>
              <Select value={formData.exam} onValueChange={(value) => updateField("exam", value)}>
                <SelectTrigger id="exam"><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {getExamOptions().map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="stream">Stream *</Label>
            <Select value={formData.stream} onValueChange={(value) => updateField("stream", value)}>
              <SelectTrigger id="stream"><SelectValue placeholder="Select stream" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" value={formData.state} onChange={(e) => updateField("state", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" value={formData.country} onChange={(e) => updateField("country", e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Onboarding
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

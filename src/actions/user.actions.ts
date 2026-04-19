'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { z } from 'zod';

const studentProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1, "Name is required."),
  phone: z.string().min(1, "Phone is required."),
  profilePic: z.string().nullable(),
  dob: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Gender is required."),
  bio: z.string().min(1, "Bio is required.").max(150),
  class: z.string().min(1, "Class is required."),
  exam: z.string().min(1, "Exam is required."),
  stream: z.string().min(1, "Stream is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  lastProfileUpdate: z.number().nullable(),
});

type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export async function completeOnboardingAction(formData: StudentProfileInput) {
    const validatedFields = studentProfileSchema.safeParse(formData);

    if (!validatedFields.success) {
        console.error(validatedFields.error.flatten());
        return { error: "Invalid data provided. Check console for details." };
    }
    
    const { uid, ...data } = validatedFields.data;
    
    try {
        const studentRef = doc(db, 'students', uid);
        await setDoc(studentRef, {
            ...data,
            uid,
            lastProfileUpdate: data.lastProfileUpdate ? new Date(data.lastProfileUpdate) : null,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        
        revalidatePath('/dashboard');
        
        return { success: true };
    } catch (error) {
        console.error("Error completing onboarding: ", error);
        return { error: 'Failed to save profile.' };
    }
}

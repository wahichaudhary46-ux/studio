import type { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export interface StudentProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  profilePic?: string | null;
  dob: string;
  gender: string;
  admissionNumber?: string;
  bio: string;
  class: string;
  exam: string;
  stream: string;
  city: string;
  state: string;
  country: string;
  lastProfileUpdate?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

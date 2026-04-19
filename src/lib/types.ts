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

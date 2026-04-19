'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { summarizeNote } from '@/ai/flows/note-summarization-flow';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().max(100, "Title is too long."),
  content: z.string(),
  userId: z.string(),
});

export async function createNoteAction(formData: { title: string; content: string; userId: string }) {
  const validatedFields = noteSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }

  const { title, content, userId } = validatedFields.data;

  try {
    const docRef = await addDoc(collection(db, 'notes'), {
      userId,
      title: title || 'Untitled Note',
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      summary: '',
    });
    
    revalidatePath('/dashboard');

    // Trigger summarization asynchronously
    summarizeAndSave(docRef.id, content);
    
    return { success: true, noteId: docRef.id };
  } catch (error) {
    console.error("Error creating note: ", error);
    return { error: 'Failed to create note.' };
  }
}

export async function updateNoteAction(noteId: string, formData: { title: string; content: string; userId: string }) {
    const validatedFields = noteSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid data provided." };
    }

    const { title, content } = validatedFields.data;
    const noteRef = doc(db, 'notes', noteId);

    try {
        await updateDoc(noteRef, {
            title: title || 'Untitled Note',
            content,
            updatedAt: serverTimestamp(),
        });

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/notes/${noteId}`);
        
        // Trigger summarization asynchronously
        summarizeAndSave(noteId, content);

        return { success: true };
    } catch (error) {
        console.error("Error updating note: ", error);
        return { error: 'Failed to update note.' };
    }
}

export async function deleteNoteAction(noteId: string) {
    try {
        await deleteDoc(doc(db, 'notes', noteId));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting note: ", error);
        return { error: 'Failed to delete note.' };
    }
}


async function summarizeAndSave(noteId: string, content: string) {
  if (!content.trim()) return;
  try {
    const { summary } = await summarizeNote({ noteContent: content });
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, { summary });
    revalidatePath(`/dashboard/notes/${noteId}`);
  } catch (e) {
    console.error("Failed to summarize and save note.", e);
  }
}

export async function getSummaryAction(noteContent: string) {
    if (!noteContent.trim()) {
        return { summary: 'Please provide content to summarize.' };
    }
    try {
        const { summary } = await summarizeNote({ noteContent });
        return { summary };
    } catch (e) {
        console.error("Error getting summary: ", e);
        return { error: 'Failed to generate summary.' };
    }
}

'use client';

import { NoteEditor } from '@/components/note-editor';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { type Note } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotePage() {
  const { noteId } = useParams() as { noteId: string };
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !noteId) return;

    setLoading(true);
    const noteRef = doc(db, 'notes', noteId);
    
    const unsubscribe = onSnapshot(noteRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Note;
        if (data.userId === user.uid) {
          setNote(data);
          setError(null);
        } else {
          setError("You don't have permission to view this note.");
        }
      } else {
        setError("Note not found.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [noteId, user]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-2rem)] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-card text-destructive">
          <ShieldAlert className="h-12 w-12" />
          <h2 className="mt-4 font-headline text-2xl font-semibold">Access Denied</h2>
          <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (note) {
    return <NoteEditor note={note} />;
  }
  
  return null;
}

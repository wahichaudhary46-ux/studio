'use client';

import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { type Note } from '@/lib/types';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export function NoteList() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (notes.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-8">
        No notes yet. Create one!
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 pr-2">
        {notes.map((note) => {
          const isActive = pathname === `/dashboard/notes/${note.id}`;
          return (
            <Link
              href={`/dashboard/notes/${note.id}`}
              key={note.id}
              className={cn(
                'block rounded-lg border p-3 transition-colors',
                isActive
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-accent/50'
              )}
            >
              <h3 className="truncate font-semibold">{note.title || 'Untitled Note'}</h3>
              <p className="mt-1 text-sm text-muted-foreground truncate">
                {note.content.substring(0, 50) || 'No content'}...
              </p>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}

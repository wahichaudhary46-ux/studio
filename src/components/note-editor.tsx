'use client';

import { type Note } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import React, { useTransition } from 'react';

import { createNoteAction, updateNoteAction, deleteNoteAction, getSummaryAction } from '@/actions/note.actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const noteSchema = z.object({
  title: z.string().max(100, "Title can't exceed 100 characters.").optional(),
  content: z.string().min(1, 'Note content cannot be empty.'),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  note?: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSummarizing, startSummaryTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [summary, setSummary] = React.useState(note?.summary || '');
  
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  const onSubmit = (data: NoteFormValues) => {
    if (!user) return;
    startTransition(async () => {
      const payload = { ...data, userId: user.uid };
      if (note) {
        const result = await updateNoteAction(note.id, payload);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
          toast({ title: 'Success', description: 'Note updated successfully.' });
        }
      } else {
        const result = await createNoteAction(payload);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
          toast({ title: 'Success', description: 'Note created successfully.' });
          if(result.noteId) router.push(`/dashboard/notes/${result.noteId}`);
        }
      }
    });
  };

  const handleDelete = () => {
    if (!note) return;
    startDeleteTransition(async () => {
        const result = await deleteNoteAction(note.id);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Note deleted.' });
            router.push('/dashboard');
        }
    });
  };

  const handleSummarize = () => {
    const content = form.getValues('content');
    if (!content) {
        toast({ variant: 'destructive', title: 'Cannot summarize', description: 'Note content is empty.' });
        return;
    }
    startSummaryTransition(async () => {
        const result = await getSummaryAction(content);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.summary) {
            setSummary(result.summary);
            // also save it
            if(note && user) {
              await updateNoteAction(note.id, { title: form.getValues('title') || '', content, userId: user.uid });
            }
        }
    });
  };
  
  React.useEffect(() => {
    setSummary(note?.summary || '');
  }, [note?.summary]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold">
              {note ? 'Edit Note' : 'New Note'}
            </h1>
            <div className="flex gap-2">
                {note && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your note.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Note
                </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 flex-1 min-h-0">
            <div className="md:col-span-2 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note Title" {...field} className="text-lg font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-col">
                    <FormLabel className="sr-only">Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Start writing your note..." {...field} className="flex-1 text-base resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">AI Summary</CardTitle>
                        <Button variant="outline" size="sm" type="button" onClick={handleSummarize} disabled={isSummarizing}>
                           {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Summarize
                        </Button>
                    </CardHeader>
                    <CardContent>
                      {isSummarizing && !summary && <p className="text-muted-foreground text-sm">Generating summary...</p>}
                      {!isSummarizing && !summary && <p className="text-muted-foreground text-sm">Click "Summarize" to generate an AI summary of your note.</p>}
                      {summary && <p className="text-sm">{summary}</p>}
                    </CardContent>
                </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

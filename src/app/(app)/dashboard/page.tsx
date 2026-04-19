import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex h-[calc(100vh-2rem)] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-card">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 font-headline text-2xl font-semibold">Welcome to SparkMemo</h2>
        <p className="mt-2 text-muted-foreground">Select a note from the list to view or edit it, or create a new one.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/notes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create a New Note
          </Link>
        </Button>
      </div>
    </div>
  );
}

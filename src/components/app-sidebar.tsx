'use client';

import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { NoteList } from './note-list';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="font-headline text-2xl font-semibold tracking-tight text-primary">
            SparkMemo
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-2">
        <Button asChild>
          <Link href="/dashboard/notes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Link>
        </Button>
        <div className="mt-4 flex-1">
          <NoteList />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}

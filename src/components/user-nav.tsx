'use client';

import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StudentProfile } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export function UserNav() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<StudentProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsub = onSnapshot(doc(db, 'students', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getInitials = (name?: string | null) => {
    if (!name) return <UserIcon className="h-4 w-4" />;
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const displayName = profile?.name || user?.displayName || 'User';
  const displayPhone = profile?.phone;
  const photoURL = profile?.profilePic || user?.photoURL;

  if (!user) {
    return null;
  }

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start gap-2">
          <Avatar className="h-8 w-8">
            {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start space-y-1 truncate">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            {displayPhone && <p className="text-xs leading-none text-muted-foreground truncate">{displayPhone}</p>}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {displayPhone && <p className="text-xs leading-none text-muted-foreground">{displayPhone}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

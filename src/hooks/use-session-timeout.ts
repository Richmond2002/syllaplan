
"use client";

import { useEffect, useCallback, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { app } from '@/lib/firebase/client';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => {
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
      });
      router.push('/login');
    }).catch((error) => {
      console.error("Error signing out: ", error);
      toast({
        title: "Logout Error",
        description: "Could not log you out automatically.",
        variant: "destructive",
      });
    });
  }, [auth, router, toast]);

  const resetTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const eventListener = () => {
      resetTimeout();
    };

    // Set the initial timer
    resetTimeout();

    // Add event listeners
    events.forEach(event => window.addEventListener(event, eventListener));

    // Cleanup function
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => window.removeEventListener(event, eventListener));
    };
  }, [resetTimeout]);
}

'use client';

import { SessionProvider } from 'next-auth/react';

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

/**
 * Session Provider for NextAuth
 * Wraps the application to provide session context
 */
export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

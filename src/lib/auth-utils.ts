import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get current authenticated user (or null)
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication, redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Require ADMIN or SUPER_ADMIN role
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  if (user.status !== 'VERIFIED') {
    redirect('/pending-verification');
  }

  return user;
}

/**
 * Require SUPER_ADMIN role only
 */
export async function requireSuperAdmin() {
  const user = await requireAuth();

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return user;
}

/**
 * Check if user has specific role (no redirect)
 */
export async function hasRole(role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role || (role === 'ADMIN' && user?.role === 'SUPER_ADMIN');
}

/**
 * Check if user is authenticated (no redirect)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

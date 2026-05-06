import { sql } from '@/lib/db';
import type { User, CreateUserInput, UserRole, UserStatus } from '@/types';
import bcrypt from 'bcryptjs';

/**
 * Find user by email (for login)
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return result[0] ?? null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
    FROM users
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return result[0] ?? null;
}

/**
 * Create new user with hashed password
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  const [user] = await sql<User[]>`
    INSERT INTO users (name, email, password, role, status)
    VALUES (
      ${data.name}, 
      ${data.email}, 
      ${hashedPassword}, 
      ${data.role || 'USER'},
      ${data.status || 'PENDING'}
    )
    RETURNING 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
  `;
  
  return user;
}

/**
 * Get all active users (for admin)
 */
export async function getAllUsers(page: number = 1, limit: number = 20): Promise<User[]> {
  const offset = (page - 1) * limit;
  
  return await sql<User[]>`
    SELECT 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
    FROM users
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

/**
 * Update user
 */
export async function updateUser(
  id: string, 
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User | null> {
  const result = await sql<User[]>`
    UPDATE users
    SET 
      name = COALESCE(${data.name ?? null}, name),
      email = COALESCE(${data.email ?? null}, email),
      image = COALESCE(${data.image ?? null}, image),
      bio = COALESCE(${data.bio ?? null}, bio),
      role = COALESCE(${data.role ?? null}, role),
      status = COALESCE(${data.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
  `;
  
  return result[0] ?? null;
}

/**
 * Update user password
 */
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await sql`
    UPDATE users
    SET password = ${hashedPassword}, updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Soft delete user
 */
export async function softDeleteUser(id: string): Promise<void> {
  await sql`
    UPDATE users
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Restore soft-deleted user
 */
export async function restoreUser(id: string): Promise<void> {
  await sql`
    UPDATE users
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Hard delete user (permanent)
 */
export async function hardDeleteUser(id: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${id}`;
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(): Promise<{ total: number; verified: number; pending: number; rejected: number }> {
  const result = await sql<{ total: number; verified: number; pending: number; rejected: number }[]>`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'VERIFIED' AND deleted_at IS NULL) as verified,
      COUNT(*) FILTER (WHERE status = 'PENDING' AND deleted_at IS NULL) as pending,
      COUNT(*) FILTER (WHERE status = 'REJECTED' OR deleted_at IS NOT NULL) as rejected
    FROM users
  `;
  
  return result[0] ?? { total: 0, verified: 0, pending: 0, rejected: 0 };
}

/**
 * Get users for admin (with filters)
 */
export async function getAdminUsers(
  page: number = 1,
  limit: number = 20,
  status?: UserStatus,
  role?: UserRole,
  searchQuery?: string
): Promise<User[]> {
  const offset = (page - 1) * limit;
  
  let statusFilter = sql`TRUE`;
  let roleFilter = sql`TRUE`;
  let searchFilter = sql`TRUE`;
  
  if (status) {
    statusFilter = sql`u.status = ${status}`;
  }
  
  if (role) {
    roleFilter = sql`u.role = ${role}`;
  }
  
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    searchFilter = sql`(u.name ILIKE ${searchTerm} OR u.email ILIKE ${searchTerm})`;
  }
  
  return await sql<User[]>`
    SELECT 
      u.id, u.name, u.email, u.password, u.image, u.bio,
      u.role, u.status, u.created_at as "createdAt",
      u.updated_at as "updatedAt", u.deleted_at as "deletedAt"
    FROM users u
    WHERE ${statusFilter}
      AND ${roleFilter}
      AND ${searchFilter}
      AND u.deleted_at IS NULL
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

/**
 * Get user by ID with full details
 */
export async function getUserByIdWithDetails(id: string): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT 
      id, name, email, password, image, bio,
      role, status, created_at as "createdAt",
      updated_at as "updatedAt", deleted_at as "deletedAt"
    FROM users
    WHERE id = ${id}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  return result[0] ?? null;
}

/**
 * Check if email exists (for uniqueness validation)
 */
export async function checkEmailExists(
  email: string,
  excludeId?: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM users
    WHERE email = ${email}
      ${excludeId ? sql`AND id != ${excludeId}` : sql``}
      AND deleted_at IS NULL
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

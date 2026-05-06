import { sql } from '@/lib/db';
import type { AdminLog } from '@/types';

// ============================================================
// ADMIN LOG QUERIES
// ============================================================

/**
 * Get recent admin logs with user info
 * 2-table JOIN: admin_logs + users
 */
export async function getRecentLogs(
  limit: number = 50
): Promise<(AdminLog & { userName: string })[]> {
  const result = await sql`
    SELECT 
      al.id, al.action, al.details, al.user_id, al.created_at,
      u.name AS user_name
    FROM admin_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    action: row.action,
    details: row.details ?? row.DETAILS ?? null,
    userId: row.user_id,
    createdAt: row.created_at,
    userName: row.user_name,
  })) as (AdminLog & { userName: string })[];
}

/**
 * Get logs by user ID
 */
export async function getLogsByUserId(
  userId: string,
  limit: number = 50
): Promise<AdminLog[]> {
  const result = await sql`
    SELECT id, action, details, user_id, created_at
    FROM admin_logs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    action: row.action,
    details: row.details ?? row.DETAILS ?? null,
    userId: row.user_id,
    createdAt: row.created_at,
  })) as AdminLog[];
}

/**
 * Get logs by action type
 */
export async function getLogsByAction(
  action: string,
  limit: number = 50
): Promise<(AdminLog & { userName: string })[]> {
  const result = await sql`
    SELECT 
      al.id, al.action, al.details, al.user_id, al.created_at,
      u.name AS user_name
    FROM admin_logs al
    JOIN users u ON al.user_id = u.id
    WHERE al.action = ${action}
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    action: row.action,
    details: row.details ?? row.DETAILS ?? null,
    userId: row.user_id,
    createdAt: row.created_at,
    userName: row.user_name,
  })) as (AdminLog & { userName: string })[];
}

/**
 * Get logs by date range
 */
export async function getLogsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 100
): Promise<(AdminLog & { userName: string })[]> {
  const result = await sql`
    SELECT 
      al.id, al.action, al.details, al.user_id, al.created_at,
      u.name AS user_name
    FROM admin_logs al
    JOIN users u ON al.user_id = u.id
    WHERE al.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    action: row.action,
    details: row.details ?? row.DETAILS ?? null,
    userId: row.user_id,
    createdAt: row.created_at,
    userName: row.user_name,
  })) as (AdminLog & { userName: string })[];
}

// ============================================================
// FILTERED ADMIN LOGS (for admin logs page)
// ============================================================

/**
 * Get filtered admin logs with pagination
 */
export async function getFilteredAdminLogs({
  action,
  entity,
  adminId,
  page = 1,
  perPage = 25,
}: {
  action?: string;
  entity?: string;
  adminId?: string;
  page?: number;
  perPage?: number;
}): Promise<(AdminLog & { userName: string; userEmail: string })[]> {
  const offset = (page - 1) * perPage;
  
  let actionFilter = sql`TRUE`;
  let userFilter = sql`TRUE`;
  
  if (action) {
    actionFilter = sql`al.action ILIKE ${`%${action}%`}`;
  }
  
  if (adminId) {
    userFilter = sql`al.user_id = ${adminId}`;
  }
  
  // Backward compatible query - entity columns might not exist yet
  try {
    const result = await sql`
      SELECT 
        al.id, al.action, al.entity, al.entity_id, al.details, al.user_id, al.created_at,
        u.name AS user_name, u.email AS user_email
      FROM admin_logs al
      JOIN users u ON al.user_id = u.id
      WHERE ${actionFilter}
        AND ${userFilter}
      ORDER BY al.created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `;
    
    return result.map((row: any) => ({
      id: row.id,
      action: row.action,
      entity: row.entity ?? null,
      entityId: row.entity_id ?? null,
      details: row.details ?? row.DETAILS ?? null,
      userId: row.user_id,
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
    })) as (AdminLog & { userName: string; userEmail: string })[];
  } catch (error) {
    // Fallback: query without entity columns (migration not applied yet)
    const result = await sql`
      SELECT 
        al.id, al.action, al.details, al.user_id, al.created_at,
        u.name AS user_name, u.email AS user_email
      FROM admin_logs al
      JOIN users u ON al.user_id = u.id
      WHERE ${actionFilter}
        AND ${userFilter}
      ORDER BY al.created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `;
    
    return result.map((row: any) => ({
      id: row.id,
      action: row.action,
      entity: null,
      entityId: null,
      details: row.details ?? row.DETAILS ?? null,
      userId: row.user_id,
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
    })) as (AdminLog & { userName: string; userEmail: string })[];
  }
}

/**
 * Get total count of filtered admin logs
 */
export async function getFilteredAdminLogsCount({
  action,
  entity,
  adminId,
}: {
  action?: string;
  entity?: string;
  adminId?: string;
}): Promise<number> {
  let actionFilter = sql`TRUE`;
  let userFilter = sql`TRUE`;
  
  if (action) {
    actionFilter = sql`action ILIKE ${`%${action}%`}`;
  }
  
  if (adminId) {
    userFilter = sql`user_id = ${adminId}`;
  }
  
  try {
    const result = await sql<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM admin_logs
      WHERE ${actionFilter}
        AND ${userFilter}
    `;
    
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get unique actions for filter dropdown
 */
export async function getAdminLogActions(): Promise<{ action: string }[]> {
  const result = await sql<{ action: string }[]>`
    SELECT DISTINCT action
    FROM admin_logs
    ORDER BY action ASC
  `;
  
  return result;
}

/**
 * Get unique admins (users who have admin logs)
 */
export async function getAdminLogFilters(): Promise<{ userId: string; userName: string }[]> {
  const result = await sql`
    SELECT DISTINCT 
      al.user_id,
      u.name AS user_name
    FROM admin_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY u.name ASC
  `;
  
  return result.map((row: any) => ({
    userId: row.user_id,
    userName: row.user_name,
  }));
}

// ============================================================
// ADMIN LOG MUTATIONS
// ============================================================

/**
 * Create admin log entry
 * Should be called after every significant admin action
 */
export async function createLog(
  userId: string,
  action: string,
  entity?: string,
  entityId?: string,
  details?: string
): Promise<{ id: string }> {
  const [log] = await sql<{ id: string }[]>`
    INSERT INTO admin_logs (action, entity, entity_id, details, user_id)
    VALUES (${action}, ${entity ?? null}, ${entityId ?? null}, ${details ?? null}, ${userId})
    RETURNING id
  `;
  
  return log;
}

// ============================================================
// COMMON ADMIN ACTIONS (convenience functions)
// ============================================================

/**
 * Log article creation
 */
export async function logArticleCreated(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_CREATED',
    'Article',
    articleId,
    `Created article "${articleTitle}"`
  );
}

/**
 * Log article update
 */
export async function logArticleUpdated(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_UPDATED',
    'Article',
    articleId,
    `Updated article "${articleTitle}"`
  );
}

/**
 * Log article publish
 */
export async function logArticlePublished(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_PUBLISHED',
    'Article',
    articleId,
    `Published article "${articleTitle}"`
  );
}

/**
 * Log article archive
 */
export async function logArticleArchived(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_ARCHIVED',
    'Article',
    articleId,
    `Archived article "${articleTitle}"`
  );
}

/**
 * Log article soft delete
 */
export async function logArticleSoftDeleted(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_SOFT_DELETED',
    'Article',
    articleId,
    `Soft-deleted article "${articleTitle}"`
  );
}

/**
 * Log article hard delete
 */
export async function logArticleHardDeleted(
  userId: string,
  articleId: string,
  articleTitle: string
): Promise<void> {
  await createLog(
    userId,
    'ARTICLE_HARD_DELETED',
    'Article',
    articleId,
    `Permanently deleted article "${articleTitle}"`
  );
}

/**
 * Log category creation
 */
export async function logCategoryCreated(
  userId: string,
  categoryId: string,
  categoryName: string
): Promise<void> {
  await createLog(
    userId,
    'CATEGORY_CREATED',
    'Category',
    categoryId,
    `Created category "${categoryName}"`
  );
}

/**
 * Log tag creation
 */
export async function logTagCreated(
  userId: string,
  tagId: string,
  tagName: string
): Promise<void> {
  await createLog(
    userId,
    'TAG_CREATED',
    'Tag',
    tagId,
    `Created tag "${tagName}"`
  );
}

/**
 * Log user verification
 */
export async function logUserVerified(
  userId: string,
  verifiedUserId: string,
  verifiedUserName: string
): Promise<void> {
  await createLog(
    userId,
    'USER_VERIFIED',
    'User',
    verifiedUserId,
    `Verified user "${verifiedUserName}"`
  );
}

/**
 * Log user role change
 */
export async function logUserRoleChanged(
  adminUserId: string,
  targetUserId: string,
  targetUserName: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await createLog(
    adminUserId,
    'USER_ROLE_CHANGED',
    'User',
    targetUserId,
    `Changed role for "${targetUserName}": ${oldRole} → ${newRole}`
  );
}

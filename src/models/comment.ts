import { sql } from '@/lib/db';
import type { Comment, CommentWithUser, CreateCommentInput } from '@/types';

// ============================================================
// COMMENT QUERIES
// ============================================================

/**
 * Get comments by article ID (with user info)
 * 3-table JOIN: comments + users + articles
 */
export async function getCommentsByArticleId(
  articleId: string,
  page: number = 1,
  limit: number = 50
): Promise<CommentWithUser[]> {
  const offset = (page - 1) * limit;
  
  return await sql<CommentWithUser[]>`
    SELECT 
      cm.id, cm.content, cm.created_at, cm.updated_at,
      u.id AS user_id, u.name AS user_name, u.image AS user_image
    FROM comments cm
    JOIN users u ON cm.user_id = u.id
    JOIN articles a ON cm.article_id = a.id
    WHERE cm.article_id = ${articleId} 
      AND cm.deleted_at IS NULL
    ORDER BY cm.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

/**
 * Get total comment count for article
 */
export async function getArticleCommentsCount(
  articleId: string
): Promise<number> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM comments
    WHERE article_id = ${articleId} AND deleted_at IS NULL
  `;
  
  return result[0]?.count ?? 0;
}

/**
 * Get comment by ID
 */
export async function getCommentById(
  id: string
): Promise<Comment | null> {
  const result = await sql<Comment[]>`
    SELECT id, content, article_id, user_id, created_at, updated_at, deleted_at
    FROM comments
    WHERE id = ${id}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get comments by user ID
 */
export async function getCommentsByUserId(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<Comment[]> {
  const offset = (page - 1) * limit;
  
  return await sql<Comment[]>`
    SELECT id, content, article_id, user_id, created_at, updated_at, deleted_at
    FROM comments
    WHERE user_id = ${userId} AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

// ============================================================
// COMMENT MUTATIONS
// ============================================================

/**
 * Create new comment
 */
export async function createComment(
  data: CreateCommentInput
): Promise<{ id: string }> {
  const [comment] = await sql<{ id: string }[]>`
    INSERT INTO comments (content, article_id, user_id)
    VALUES (${data.content}, ${data.articleId}, ${data.userId})
    RETURNING id
  `;
  
  return comment;
}

/**
 * Update comment content
 */
export async function updateComment(
  id: string,
  content: string
): Promise<void> {
  await sql`
    UPDATE comments 
    SET content = ${content}, updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Soft delete comment
 */
export async function softDeleteComment(id: string): Promise<void> {
  await sql`
    UPDATE comments 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Restore soft-deleted comment
 */
export async function restoreComment(id: string): Promise<void> {
  await sql`
    UPDATE comments 
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Hard delete comment (admin only - for spam/abuse)
 */
export async function hardDeleteComment(id: string): Promise<void> {
  await sql`
    DELETE FROM comments WHERE id = ${id}
  `;
}

/**
 * Check if user owns comment
 */
export async function userOwnsComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM comments
    WHERE id = ${commentId} AND user_id = ${userId}
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

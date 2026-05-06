import { sql } from '@/lib/db';
import type { Reaction, ReactionType, ReactionCounts } from '@/types';

// ============================================================
// REACTION QUERIES
// ============================================================

/**
 * Get reaction counts for an article (aggregation)
 */
export async function getReactionCounts(
  articleId: string
): Promise<ReactionCounts> {
  const result = await sql<{ type: string; count: number }[]>`
    SELECT type, COUNT(*) as count
    FROM reactions
    WHERE article_id = ${articleId}
    GROUP BY type
  `;
  
  return {
    likes: result.find(r => r.type === 'LIKE')?.count ?? 0,
    dislikes: result.find(r => r.type === 'DISLIKE')?.count ?? 0,
  };
}

/**
 * Get user's reaction on an article
 */
export async function getUserReaction(
  articleId: string,
  userId: string
): Promise<Reaction | null> {
  const result = await sql<Reaction[]>`
    SELECT id, type, article_id, user_id, created_at
    FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Check if user has reacted to article
 */
export async function hasUserReacted(
  articleId: string,
  userId: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

// ============================================================
// REACTION MUTATIONS
// ============================================================

/**
 * Toggle reaction (like/dislike)
 * - If same type: remove reaction (toggle off)
 * - If different type: update reaction
 * - If no reaction: create new
 */
export async function toggleReaction(
  articleId: string,
  userId: string,
  type: ReactionType
): Promise<{ action: 'created' | 'updated' | 'removed'; type?: ReactionType }> {
  // Check existing reaction
  const existing = await sql<{ id: string; type: ReactionType }[]>`
    SELECT id, type FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;

  if (existing.length > 0) {
    const currentReaction = existing[0];
    
    if (currentReaction.type === type) {
      // Same type - remove it (toggle off)
      await sql`
        DELETE FROM reactions
        WHERE article_id = ${articleId} AND user_id = ${userId}
      `;
      return { action: 'removed' };
    } else {
      // Different type - update it
      await sql`
        UPDATE reactions
        SET type = ${type}, created_at = NOW()
        WHERE article_id = ${articleId} AND user_id = ${userId}
      `;
      return { action: 'updated', type };
    }
  } else {
    // No existing reaction - create new
    await sql`
      INSERT INTO reactions (type, article_id, user_id)
      VALUES (${type}, ${articleId}, ${userId})
    `;
    return { action: 'created', type };
  }
}

/**
 * Create reaction (insert only)
 */
export async function createReaction(
  articleId: string,
  userId: string,
  type: ReactionType
): Promise<void> {
  await sql`
    INSERT INTO reactions (type, article_id, user_id)
    VALUES (${type}, ${articleId}, ${userId})
    ON CONFLICT (article_id, user_id) DO UPDATE
    SET type = ${type}, created_at = NOW()
  `;
}

/**
 * Remove reaction
 */
export async function removeReaction(
  articleId: string,
  userId: string
): Promise<void> {
  await sql`
    DELETE FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;
}

/**
 * Get all reactions by user
 */
export async function getUserReactions(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<Reaction[]> {
  const offset = (page - 1) * limit;
  
  return await sql<Reaction[]>`
    SELECT id, type, article_id, user_id, created_at
    FROM reactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

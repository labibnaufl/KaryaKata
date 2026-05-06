import { sql } from '@/lib/db';
import type { Bookmark, BookmarkWithArticle, ArticleWithAuthor } from '@/types';

// ============================================================
// BOOKMARK QUERIES
// ============================================================

/**
 * Get user's bookmarks with article details
 * 3-table JOIN: bookmarks + articles + users
 */
export async function getUserBookmarks(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<BookmarkWithArticle[]> {
  const offset = (page - 1) * limit;
  
  const bookmarks = await sql<(Bookmark & ArticleWithAuthor)[]>`
    SELECT 
      b.id, b.article_id, b.user_id, b.created_at as bookmarked_at,
      a.id as article_id, a.title, a.slug, a.excerpt, a.cover_image,
      a.status, a.view_count, a.published_at,
      u.name AS author_name, u.image AS author_image,
      c.name AS category_name, c.slug AS category_slug, c.color AS category_color
    FROM bookmarks b
    JOIN articles a ON b.article_id = a.id
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE b.user_id = ${userId}
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
    ORDER BY b.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return bookmarks.map(b => ({
    id: b.id,
    articleId: b.article_id,
    userId: b.user_id,
    createdAt: b.bookmarked_at,
    article: {
      id: b.article_id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImage: b.cover_image,
      status: b.status,
      viewCount: b.view_count,
      publishedAt: b.published_at,
      authorName: b.author_name,
      authorImage: b.author_image,
      categoryName: b.category_name,
      categorySlug: b.category_slug,
      categoryColor: b.category_color,
    } as ArticleWithAuthor,
  }));
}

/**
 * Check if user has bookmarked an article
 */
export async function isBookmarked(
  articleId: string,
  userId: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM bookmarks
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

/**
 * Get bookmark by article and user
 */
export async function getBookmark(
  articleId: string,
  userId: string
): Promise<Bookmark | null> {
  const result = await sql<Bookmark[]>`
    SELECT id, article_id, user_id, created_at
    FROM bookmarks
    WHERE article_id = ${articleId} AND user_id = ${userId}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get user's bookmark count
 */
export async function getUserBookmarksCount(userId: string): Promise<number> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM bookmarks b
    JOIN articles a ON b.article_id = a.id
    WHERE b.user_id = ${userId}
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
  `;
  
  return result[0]?.count ?? 0;
}

// ============================================================
// BOOKMARK MUTATIONS
// ============================================================

/**
 * Toggle bookmark
 * - If exists: remove it (toggle off)
 * - If not exists: create it (toggle on)
 * Returns: true if bookmarked, false if unbookmarked
 */
export async function toggleBookmark(
  articleId: string,
  userId: string
): Promise<{ isBookmarked: boolean }> {
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM bookmarks
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;

  if (existing.length > 0) {
    // Remove bookmark
    await sql`
      DELETE FROM bookmarks
      WHERE article_id = ${articleId} AND user_id = ${userId}
    `;
    return { isBookmarked: false };
  } else {
    // Create bookmark
    await sql`
      INSERT INTO bookmarks (article_id, user_id)
      VALUES (${articleId}, ${userId})
    `;
    return { isBookmarked: true };
  }
}

/**
 * Create bookmark (idempotent)
 */
export async function createBookmark(
  articleId: string,
  userId: string
): Promise<void> {
  await sql`
    INSERT INTO bookmarks (article_id, user_id)
    VALUES (${articleId}, ${userId})
    ON CONFLICT DO NOTHING
  `;
}

/**
 * Remove bookmark
 */
export async function removeBookmark(
  articleId: string,
  userId: string
): Promise<void> {
  await sql`
    DELETE FROM bookmarks
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;
}

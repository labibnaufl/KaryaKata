import { sql } from '@/lib/db';
import type {
  Article,
  ArticleWithAuthor,
  ArticleFull,
  CreateArticleInput,
  ContentStatus,
  ArticleStats,
} from '@/types';

// ============================================================
// ARTICLE QUERIES
// ============================================================

/**
 * Get published articles with pagination, optional category filter, and search
 * 3-table JOIN: articles + users + categories
 */
export async function getPublishedArticles(
  page: number = 1,
  limit: number = 9,
  categorySlug?: string,
  searchQuery?: string
): Promise<ArticleWithAuthor[]> {
  const offset = (page - 1) * limit;
  
  let categoryFilter = sql`TRUE`;
  let searchFilter = sql`TRUE`;
  
  if (categorySlug) {
    categoryFilter = sql`c.slug = ${categorySlug}`;
  }
  
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    searchFilter = sql`(a.title ILIKE ${searchTerm} OR a.excerpt ILIKE ${searchTerm})`;
  }
  
  return await sql<ArticleWithAuthor[]>`
    SELECT 
      a.id, a.title, a.slug, a.excerpt, a.cover_image AS "coverImage", a.status,
      a.view_count AS "viewCount", a.read_time AS "readTime", a.published_at AS "publishedAt", 
      a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.deleted_at AS "deletedAt",
      a.author_id AS "authorId", a.category_id AS "categoryId",
      a.body, a.meta_title AS "metaTitle", a.meta_description AS "metaDescription", a.keywords,
      u.name AS "authorName", u.image AS "authorImage",
      c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
      AND ${categoryFilter}
      AND ${searchFilter}
    ORDER BY a.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

/**
 * Get single article by slug with full details
 * 4-table JOIN: articles + users + categories + tags (JSON aggregated)
 */
export async function getArticleBySlug(
  slug: string
): Promise<ArticleFull | null> {
  const result = await sql<ArticleFull[]>`
    SELECT 
      a.*,
      u.name AS author_name, u.image AS author_image, u.bio AS author_bio,
      c.name AS category_name, c.slug AS category_slug, c.color AS category_color,
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
          ORDER BY t.name
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE a.slug = ${slug} 
      AND a.deleted_at IS NULL
    GROUP BY a.id, u.name, u.image, u.bio, c.name, c.slug, c.color
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get article by ID
 */
export async function getArticleById(
  id: string
): Promise<Article | null> {
  const result = await sql<Article[]>`
    SELECT 
      id,
      title,
      slug,
      excerpt,
      body,
      cover_image AS "coverImage",
      status,
      view_count AS "viewCount",
      read_time AS "readTime",
      meta_title AS "metaTitle",
      meta_description AS "metaDescription",
      keywords,
      published_at AS "publishedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt",
      author_id AS "authorId",
      category_id AS "categoryId"
    FROM articles
    WHERE id = ${id}
      AND deleted_at IS NULL
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Check if slug exists (optionally exclude a specific article)
 */
export async function checkSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM articles
    WHERE slug = ${slug}
      ${excludeId ? sql`AND id != ${excludeId}` : sql``}
      AND deleted_at IS NULL
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

/**
 * Get featured article (most viewed published)
 */
export async function getFeaturedArticle(): Promise<ArticleWithAuthor | null> {
  const result = await sql<ArticleWithAuthor[]>`
    SELECT 
      a.id, a.title, a.slug, a.excerpt, a.cover_image AS "coverImage", a.status,
      a.view_count AS "viewCount", a.read_time AS "readTime", a.published_at AS "publishedAt", 
      a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.deleted_at AS "deletedAt",
      a.author_id AS "authorId", a.category_id AS "categoryId",
      a.body, a.meta_title AS "metaTitle", a.meta_description AS "metaDescription", a.keywords,
      u.name AS "authorName", u.image AS "authorImage",
      c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
    ORDER BY a.view_count DESC, a.published_at DESC
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get article by ID with category and tags for editing
 */
export async function getArticleByIdWithDetails(
  id: string
): Promise<(Article & { categorySlug: string | null; categoryName: string | null; tags: { id: string; name: string }[] }) | null> {
  const result = await sql<
    (Article & { category_slug: string | null; category_name: string | null; tags: { id: string; name: string }[] })[]
  >`
    SELECT 
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.body,
      a.cover_image AS "coverImage",
      a.status,
      a.view_count AS "viewCount",
      a.read_time AS "readTime",
      a.meta_title AS "metaTitle",
      a.meta_description AS "metaDescription",
      a.keywords,
      a.published_at AS "publishedAt",
      a.created_at AS "createdAt",
      a.updated_at AS "updatedAt",
      a.deleted_at AS "deletedAt",
      a.author_id AS "authorId",
      a.category_id AS "categoryId",
      c.slug AS "category_slug",
      c.name AS "category_name",
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS "tags"
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE a.id = ${id}
      AND a.deleted_at IS NULL
    GROUP BY a.id, c.slug, c.name
    LIMIT 1
  `;

  if (!result[0]) return null;

  const row = result[0];
  return {
    ...row,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    tags: row.tags || [],
  };
}

/**
 * Get featured article (most viewed published)
 */
export async function getRelatedArticles(
  categoryId: string | null,
  excludeId: string,
  limit: number = 3
): Promise<ArticleWithAuthor[]> {
  if (!categoryId) return [];
  
  return await sql<ArticleWithAuthor[]>`
    SELECT 
      a.id, a.title, a.slug, a.excerpt, a.cover_image AS "coverImage", a.status,
      a.view_count AS "viewCount", a.read_time AS "readTime", a.published_at AS "publishedAt", 
      a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.deleted_at AS "deletedAt",
      a.author_id AS "authorId", a.category_id AS "categoryId",
      a.body, a.meta_title AS "metaTitle", a.meta_description AS "metaDescription", a.keywords,
      u.name AS "authorName", u.image AS "authorImage",
      c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
      AND a.category_id = ${categoryId}
      AND a.id != ${excludeId}
    ORDER BY a.published_at DESC
    LIMIT ${limit}
  `;
}

/**
 * Get total count of published articles
 */
export async function getPublishedArticlesCount(
  categorySlug?: string,
  searchQuery?: string
): Promise<number> {
  let categoryFilter = sql`TRUE`;
  let searchFilter = sql`TRUE`;
  
  if (categorySlug) {
    categoryFilter = sql`c.slug = ${categorySlug}`;
  }
  
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    searchFilter = sql`(a.title ILIKE ${searchTerm} OR a.excerpt ILIKE ${searchTerm})`;
  }
  
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
      AND ${categoryFilter}
      AND ${searchFilter}
  `;
  
  return result[0]?.count ?? 0;
}

// ============================================================
// ARTICLE MUTATIONS
// ============================================================

/**
 * Create new article (DRAFT by default)
 */
export async function createArticle(
  data: CreateArticleInput
): Promise<{ id: string; slug: string }> {
  const [article] = await sql<{ id: string; slug: string }[]>`
    INSERT INTO articles (
      title, slug, excerpt, body, cover_image, status,
      meta_title, meta_description, keywords, author_id, category_id
    ) VALUES (
      ${data.title},
      ${data.slug},
      ${data.excerpt ?? null},
      ${data.body},
      ${data.coverImage ?? null},
      ${data.status ?? 'DRAFT'},
      ${data.metaTitle ?? null},
      ${data.metaDescription ?? null},
      ${data.keywords ?? null},
      ${data.authorId},
      ${data.categoryId ?? null}
    )
    RETURNING id, slug
  `;
  
  return article;
}

/**
 * Update article
 */
export async function updateArticle(
  id: string,
  data: Partial<CreateArticleInput>
): Promise<void> {
  // Always update updated_at, conditionally update other fields using COALESCE
  // This pattern works with tagged template literals without needing unsafe()
  await sql`
    UPDATE articles 
    SET 
      title = COALESCE(${data.title ?? null}, title),
      slug = COALESCE(${data.slug ?? null}, slug),
      excerpt = COALESCE(${data.excerpt ?? null}, excerpt),
      body = COALESCE(${data.body ?? null}, body),
      cover_image = COALESCE(${data.coverImage ?? null}, cover_image),
      category_id = COALESCE(${data.categoryId ?? null}, category_id),
      meta_title = COALESCE(${data.metaTitle ?? null}, meta_title),
      meta_description = COALESCE(${data.metaDescription ?? null}, meta_description),
      keywords = COALESCE(${data.keywords ?? null}, keywords),
      read_time = COALESCE(${data.readTime ?? null}, read_time),
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Soft delete article
 */
export async function softDeleteArticle(id: string): Promise<void> {
  await sql`
    UPDATE articles 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Restore soft-deleted article
 */
export async function restoreArticle(id: string): Promise<void> {
  await sql`
    UPDATE articles 
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/**
 * Hard delete article (permanent)
 */
export async function hardDeleteArticle(id: string): Promise<void> {
  // Cascades will delete article_tags, comments, reactions, bookmarks
  await sql`
    DELETE FROM articles WHERE id = ${id}
  `;
}

/**
 * Update article status
 */
export async function updateArticleStatus(
  id: string,
  status: ContentStatus
): Promise<void> {
  const publishedAt = status === 'PUBLISHED' ? sql`NOW()` : sql`NULL`;
  
  await sql`
    UPDATE articles 
    SET status = ${status}, 
        published_at = ${publishedAt},
        updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string): Promise<void> {
  await sql`
    UPDATE articles 
    SET view_count = view_count + 1
    WHERE id = ${id}
  `;
}

// ============================================================
// ADMIN QUERIES
// ============================================================

/**
 * Get article statistics for dashboard
 */
export async function getArticleStats(): Promise<ArticleStats> {
  const result = await sql<ArticleStats[]>`
    SELECT 
      COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
      COUNT(*) FILTER (WHERE status = 'PUBLISHED' AND deleted_at IS NULL) as published,
      COUNT(*) FILTER (WHERE status = 'DRAFT' AND deleted_at IS NULL) as draft,
      COUNT(*) FILTER (WHERE status = 'ARCHIVED' AND deleted_at IS NULL) as archived
    FROM articles
  `;
  
  return result[0] ?? { total: 0, published: 0, draft: 0, archived: 0 };
}

/**
 * Get all articles for admin (with filters)
 */
export async function getAdminArticles(
  page: number = 1,
  limit: number = 20,
  status?: ContentStatus,
  searchQuery?: string
): Promise<ArticleWithAuthor[]> {
  const offset = (page - 1) * limit;
  
  let statusFilter = sql`TRUE`;
  let searchFilter = sql`TRUE`;

  if (status) {
    statusFilter = sql`a.status = ${status}`;
  }

  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    searchFilter = sql`(a.title ILIKE ${searchTerm} OR a.excerpt ILIKE ${searchTerm})`;
  }

  return await sql<ArticleWithAuthor[]>`
    SELECT
      a.id, a.title, a.slug, a.excerpt, a.cover_image AS "coverImage", a.status,
      a.view_count AS "viewCount", a.read_time AS "readTime", a.published_at AS "publishedAt",
      a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.deleted_at AS "deletedAt",
      a.author_id AS "authorId", a.category_id AS "categoryId",
      a.body, a.meta_title AS "metaTitle", a.meta_description AS "metaDescription", a.keywords,
      u.name AS "authorName", u.image AS "authorImage",
      c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.deleted_at IS NULL
      AND ${statusFilter}
      AND ${searchFilter}
    ORDER BY a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

/**
 * Get soft-deleted articles (trash)
 */
export async function getDeletedArticles(
  page: number = 1,
  limit: number = 20
): Promise<ArticleWithAuthor[]> {
  const offset = (page - 1) * limit;
  
  return await sql<ArticleWithAuthor[]>`
    SELECT 
      a.id, a.title, a.slug, a.excerpt, a.cover_image AS "coverImage", a.status,
      a.view_count AS "viewCount", a.read_time AS "readTime", a.published_at AS "publishedAt", 
      a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.deleted_at AS "deletedAt",
      a.author_id AS "authorId", a.category_id AS "categoryId",
      a.body, a.meta_title AS "metaTitle", a.meta_description AS "metaDescription", a.keywords,
      u.name AS "authorName", u.image AS "authorImage",
      c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.deleted_at IS NOT NULL
    ORDER BY a.deleted_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

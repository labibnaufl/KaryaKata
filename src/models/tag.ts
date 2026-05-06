import { sql } from '@/lib/db';
import type { Tag, TagWithCount, CreateTagInput } from '@/types';

// ============================================================
// TAG QUERIES
// ============================================================

/**
 * Get all available tags for article forms (simple list)
 */
export async function getAvailableTags(): Promise<Tag[]> {
  return await sql<Tag[]>`
    SELECT id, name, slug, created_at
    FROM tags
    ORDER BY name ASC
  `;
}

/**
 * Get all tags with article usage count
 */
export async function getAllTags(): Promise<TagWithCount[]> {
  return await sql<TagWithCount[]>`
    SELECT 
      t.id, t.name, t.slug, t.created_at,
      (
        SELECT COUNT(*)
        FROM article_tags at
        JOIN articles a ON at.article_id = a.id
        WHERE at.tag_id = t.id 
          AND a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
      ) AS article_count
    FROM tags t
    ORDER BY t.name ASC
  `;
}

/**
 * Get tag by ID
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const result = await sql<Tag[]>`
    SELECT id, name, slug, created_at
    FROM tags
    WHERE id = ${id}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const result = await sql<Tag[]>`
    SELECT id, name, slug, created_at
    FROM tags
    WHERE slug = ${slug}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get tags by article ID
 */
export async function getTagsByArticleId(articleId: string): Promise<Tag[]> {
  return await sql<Tag[]>`
    SELECT t.id, t.name, t.slug, t.created_at
    FROM tags t
    JOIN article_tags at ON t.id = at.tag_id
    WHERE at.article_id = ${articleId}
    ORDER BY t.name ASC
  `;
}

/**
 * Get multiple tags by IDs
 */
export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) return [];
  
  return await sql<Tag[]>`
    SELECT id, name, slug, created_at
    FROM tags
    WHERE id IN ${sql(ids)}
    ORDER BY name ASC
  `;
}

// ============================================================
// TAG MUTATIONS
// ============================================================

/**
 * Create new tag
 */
export async function createTag(data: CreateTagInput): Promise<{ id: string }> {
  const [tag] = await sql<{ id: string }[]>`
    INSERT INTO tags (name, slug)
    VALUES (${data.name}, ${data.slug})
    RETURNING id
  `;
  
  return tag;
}

/**
 * Update tag
 */
export async function updateTag(
  id: string,
  data: Partial<CreateTagInput>
): Promise<void> {
  const updates: string[] = [];
  const values: (string | null)[] = [];
  
  if (data.name !== undefined) {
    updates.push(`name = $${updates.length + 1}`);
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    updates.push(`slug = $${updates.length + 1}`);
    values.push(data.slug);
  }
  
  if (updates.length === 0) return;
  
  await sql`
    UPDATE tags 
    SET ${sql.unsafe(updates.join(', '))}
    WHERE id = ${id}
  `;
}

/**
 * Delete tag (hard delete)
 * Junction table entries will cascade delete
 */
export async function deleteTag(id: string): Promise<void> {
  await sql`
    DELETE FROM tags WHERE id = ${id}
  `;
}

// ============================================================
// ARTICLE-TAG RELATIONSHIPS
// ============================================================

/**
 * Sync article tags (delete old, insert new)
 */
export async function syncArticleTags(
  articleId: string,
  tagIds: string[]
): Promise<void> {
  // Delete existing tags for this article
  await sql`
    DELETE FROM article_tags WHERE article_id = ${articleId}
  `;
  
  // Insert new tags
  if (tagIds.length > 0) {
    const values = tagIds
      .map((tagId, index) => `(${articleId}, ${tagId})`)
      .join(', ');
    
    await sql`
      INSERT INTO article_tags (article_id, tag_id)
      VALUES ${sql.unsafe(values)}
    `;
  }
}

/**
 * Add tag to article
 */
export async function addTagToArticle(
  articleId: string,
  tagId: string
): Promise<void> {
  await sql`
    INSERT INTO article_tags (article_id, tag_id)
    VALUES (${articleId}, ${tagId})
    ON CONFLICT DO NOTHING
  `;
}

/**
 * Remove tag from article
 */
export async function removeTagFromArticle(
  articleId: string,
  tagId: string
): Promise<void> {
  await sql`
    DELETE FROM article_tags 
    WHERE article_id = ${articleId} AND tag_id = ${tagId}
  `;
}

/**
 * Check if tag slug exists (for uniqueness validation)
 */
export async function tagSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM tags
    WHERE slug = ${slug}
      ${excludeId ? sql`AND id != ${excludeId}` : sql``}
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

/**
 * Get or create tag by name (for article creation)
 */
export async function getOrCreateTagByName(
  name: string,
  slug: string
): Promise<{ id: string }> {
  // Try to find existing tag
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM tags WHERE slug = ${slug} LIMIT 1
  `;
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new tag
  return await createTag({ name, slug });
}

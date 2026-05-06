import { sql } from '@/lib/db';
import type { Category, CategoryWithCount, CreateCategoryInput } from '@/types';

// ============================================================
// CATEGORY QUERIES
// ============================================================

/**
 * Get all categories with article count
 */
export async function getAllCategories(): Promise<CategoryWithCount[]> {
  return await sql<CategoryWithCount[]>`
    SELECT 
      c.id, c.name, c.slug, c.description, c.color, c.created_at AS "createdAt",
      (
        SELECT COUNT(*)
        FROM articles a
        WHERE a.category_id = c.id 
          AND a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
      ) AS "articleCount"
    FROM categories c
    ORDER BY c.name ASC
  `;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await sql<Category[]>`
    SELECT id, name, slug, description, color, created_at AS "createdAt"
    FROM categories
    WHERE id = ${id}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await sql<Category[]>`
    SELECT id, name, slug, description, color, created_at AS "createdAt"
    FROM categories
    WHERE slug = ${slug}
    LIMIT 1
  `;
  
  return result[0] ?? null;
}

// ============================================================
// CATEGORY MUTATIONS
// ============================================================

/**
 * Create new category
 */
export async function createCategory(
  data: CreateCategoryInput
): Promise<{ id: string }> {
  const [category] = await sql<{ id: string }[]>`
    INSERT INTO categories (name, slug, description, color)
    VALUES (${data.name}, ${data.slug}, ${data.description ?? null}, ${data.color ?? null})
    RETURNING id
  `;
  
  return category;
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryInput>
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
  if (data.description !== undefined) {
    updates.push(`description = $${updates.length + 1}`);
    values.push(data.description ?? null);
  }
  if (data.color !== undefined) {
    updates.push(`color = $${updates.length + 1}`);
    values.push(data.color ?? null);
  }
  
  if (updates.length === 0) return;
  
  await sql`
    UPDATE categories 
    SET ${sql.unsafe(updates.join(', '))}
    WHERE id = ${id}
  `;
}

/**
 * Delete category (hard delete)
 * Note: Articles in this category will have category_id set to NULL
 */
export async function deleteCategory(id: string): Promise<void> {
  await sql`
    DELETE FROM categories WHERE id = ${id}
  `;
}

/**
 * Check if category slug exists (for uniqueness validation)
 */
export async function categorySlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM categories
    WHERE slug = ${slug}
      ${excludeId ? sql`AND id != ${excludeId}` : sql``}
  `;
  
  return (result[0]?.count ?? 0) > 0;
}

/**
 * Get or create category by name (for article creation)
 */
export async function getOrCreateCategoryByName(
  name: string,
  slug: string
): Promise<{ id: string }> {
  // Try to find existing category
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM categories WHERE slug = ${slug} LIMIT 1
  `;
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new category
  return await createCategory({ name, slug });
}

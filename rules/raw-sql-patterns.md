# Raw SQL Patterns — Karya Kata.

> This project uses **raw SQL only** (no ORM) with `@neondatabase/serverless`. These patterns ensure type safety, security, and maintainability across the codebase.

---

## 1. Database Client Setup

### Singleton SQL Client

**File:** `src/lib/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";

// Singleton SQL client using Neon serverless
export const sql = neon(process.env.DATABASE_URL!);
```

**Rules:**

- ✅ Always use the singleton `sql` export from `src/lib/db.ts`
- ✅ Never create new Neon clients in individual files
- ✅ Use `process.env.DATABASE_URL` (Neon provides this)

---

## 2. Tagged Template Literals (Auto-Parameterized)

### Safe Query Patterns

**✅ Good — Auto-parameterized:**

```typescript
import { sql } from "@/lib/db";

// Parameters are automatically escaped and quoted
const user = await sql`
  SELECT id, name, email, role 
  FROM users 
  WHERE email = ${email} AND deleted_at IS NULL
`;
```

**❌ Bad — String concatenation (SQL Injection risk):**

```typescript
// NEVER DO THIS
const user = await sql(
  `SELECT * FROM users WHERE email = '${email}'`, // ❌ VULNERABLE
);
```

**❌ Bad — Dynamic identifiers without sanitization:**

```typescript
// NEVER pass table/column names directly
const result = await sql`SELECT * FROM ${tableName}`; // ❌ Syntax error/wrong
```

---

## 3. Model Layer Patterns

### File Structure

```
src/models/
├── user.ts          # User CRUD operations
├── article.ts       # Article queries with JOINs
├── category.ts      # Category management
├── tag.ts           # Tag operations
├── comment.ts       # Comment CRUD
├── reaction.ts      # Like/dislike operations
├── bookmark.ts      # Bookmark operations
└── admin-log.ts     # Audit logging
```

### Model Function Patterns

**✅ Return typed arrays (always):**

```typescript
// src/models/user.ts
import { sql } from "@/lib/db";
import type { User } from "@/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await sql<User[]>`
    SELECT id, name, email, role, status, image, bio, created_at
    FROM users
    WHERE email = ${email} AND deleted_at IS NULL
    LIMIT 1
  `;
  return result[0] ?? null;
}
```

**✅ Soft delete pattern:**

```typescript
export async function softDeleteUser(id: string): Promise<void> {
  await sql`
    UPDATE users 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function restoreUser(id: string): Promise<void> {
  await sql`
    UPDATE users 
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = ${id}
  `;
}
```

**✅ Hard delete (only for reactions, bookmarks):**

```typescript
export async function deleteReaction(
  articleId: string,
  userId: string,
): Promise<void> {
  await sql`
    DELETE FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;
}
```

---

## 4. JOIN Query Patterns

### 3-Table JOIN: Article with Author + Category

```typescript
// src/models/article.ts
export async function getPublishedArticles(
  page: number = 1,
  limit: number = 9,
  categorySlug?: string,
): Promise<ArticleWithAuthor[]> {
  const offset = (page - 1) * limit;

  return await sql<ArticleWithAuthor[]>`
    SELECT 
      a.id, a.title, a.slug, a.excerpt, a.cover_image, a.status,
      a.view_count, a.read_time, a.published_at, a.created_at,
      u.name AS author_name, u.image AS author_image,
      c.name AS category_name, c.slug AS category_slug, c.color AS category_color
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
      AND ${categorySlug ? sql`c.slug = ${categorySlug}` : sql`TRUE`}
    ORDER BY a.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}
```

### 4-Table JOIN: Article Detail with Tags (JSON Aggregation)

```typescript
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  const result = await sql<ArticleDetail[]>`
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
    WHERE a.slug = ${slug} AND a.deleted_at IS NULL
    GROUP BY a.id, u.name, u.image, u.bio, c.name, c.slug, c.color
    LIMIT 1
  `;

  return result[0] ?? null;
}
```

---

## 5. Search Query Patterns

### Case-Insensitive Search with ILIKE

```typescript
export async function searchArticles(
  query: string,
  limit: number = 20,
): Promise<Article[]> {
  const searchTerm = `%${query}%`;

  return await sql<Article[]>`
    SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, a.published_at,
           u.name AS author_name, c.name AS category_name
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'PUBLISHED' 
      AND a.deleted_at IS NULL
      AND (a.title ILIKE ${searchTerm} OR a.excerpt ILIKE ${searchTerm})
    ORDER BY a.published_at DESC
    LIMIT ${limit}
  `;
}
```

---

## 6. Transaction Patterns

### Batch Operations with Explicit Transactions

```typescript
import { sql } from "@/lib/db";

export async function createArticleWithTags(
  articleData: CreateArticleInput,
  tagIds: string[],
): Promise<string> {
  // Begin transaction
  await sql`BEGIN`;

  try {
    // Insert article
    const [article] = await sql<{ id: string }[]>`
      INSERT INTO articles (title, slug, excerpt, body, author_id, category_id, status)
      VALUES (
        ${articleData.title}, 
        ${articleData.slug}, 
        ${articleData.excerpt}, 
        ${articleData.body},
        ${articleData.authorId},
        ${articleData.categoryId},
        ${articleData.status}
      )
      RETURNING id
    `;

    // Insert tag associations
    if (tagIds.length > 0) {
      const values = tagIds
        .map((tagId, i) => `(${article.id}, ${tagId})`)
        .join(", ");

      await sql`
        INSERT INTO article_tags (article_id, tag_id)
        VALUES ${sql.unsafe(values)}
      `;
    }

    // Commit transaction
    await sql`COMMIT`;

    return article.id;
  } catch (error) {
    // Rollback on error
    await sql`ROLLBACK`;
    throw error;
  }
}
```

**⚠️ Note:** For complex transactions, consider using a connection pool with explicit client:

```typescript
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function withTransaction<T>(
  callback: (client: any) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 7. Aggregation & Subquery Patterns

### Article Count by Category (Subquery)

```typescript
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  return await sql<CategoryWithCount[]>`
    SELECT 
      c.id, c.name, c.slug, c.description, c.color,
      (
        SELECT COUNT(*)
        FROM articles a
        WHERE a.category_id = c.id 
          AND a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
      ) AS article_count
    FROM categories c
    ORDER BY c.name
  `;
}
```

### Reaction Counts (Aggregation)

```typescript
export async function getReactionCounts(
  articleId: string,
): Promise<ReactionCounts> {
  const result = await sql<{ type: string; count: number }[]>`
    SELECT type, COUNT(*) as count
    FROM reactions
    WHERE article_id = ${articleId}
    GROUP BY type
  `;

  return {
    likes: result.find((r) => r.type === "LIKE")?.count ?? 0,
    dislikes: result.find((r) => r.type === "DISLIKE")?.count ?? 0,
  };
}
```

---

## 8. Upsert Pattern (INSERT ... ON CONFLICT)

### Toggle Reaction (Insert or Delete)

```typescript
export async function toggleReaction(
  articleId: string,
  userId: string,
  type: "LIKE" | "DISLIKE",
): Promise<void> {
  // First, check existing reaction
  const existing = await sql<{ type: string }[]>`
    SELECT type FROM reactions
    WHERE article_id = ${articleId} AND user_id = ${userId}
  `;

  if (existing.length > 0) {
    if (existing[0].type === type) {
      // Same reaction type - remove it (toggle off)
      await sql`
        DELETE FROM reactions
        WHERE article_id = ${articleId} AND user_id = ${userId}
      `;
    } else {
      // Different reaction type - update it
      await sql`
        UPDATE reactions
        SET type = ${type}, created_at = NOW()
        WHERE article_id = ${articleId} AND user_id = ${userId}
      `;
    }
  } else {
    // No existing reaction - insert new
    await sql`
      INSERT INTO reactions (type, article_id, user_id)
      VALUES (${type}, ${articleId}, ${userId})
    `;
  }
}
```

---

## 9. Date & Time Patterns

### Using PostgreSQL Date Functions

```typescript
// Get recent articles (last 7 days)
export async function getRecentArticles(days: number = 7): Promise<Article[]> {
  return await sql<Article[]>`
    SELECT *
    FROM articles
    WHERE published_at >= NOW() - INTERVAL '${days} days'
      AND status = 'PUBLISHED'
      AND deleted_at IS NULL
    ORDER BY published_at DESC
  `;
}

// Format dates with PostgreSQL
export async function getArticlesWithFormattedDate(): Promise<Article[]> {
  return await sql<Article[]>`
    SELECT 
      id, title, slug,
      TO_CHAR(published_at, 'YYYY-MM-DD') AS published_date,
      TO_CHAR(published_at, 'Month DD, YYYY') AS published_date_formatted
    FROM articles
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC
  `;
}
```

---

## 10. Pagination Patterns

### Cursor-Based Pagination (Preferred for Large Datasets)

```typescript
export async function getArticlesCursor(
  cursor?: string,
  limit: number = 10,
): Promise<{ articles: Article[]; nextCursor: string | null }> {
  const articles = await sql<Article[]>`
    SELECT id, title, slug, published_at
    FROM articles
    WHERE status = 'PUBLISHED' 
      AND deleted_at IS NULL
      AND ${cursor ? sql`published_at < ${cursor}` : sql`TRUE`}
    ORDER BY published_at DESC
    LIMIT ${limit + 1}
  `;

  const hasMore = articles.length > limit;
  const results = hasMore ? articles.slice(0, -1) : articles;
  const nextCursor = hasMore ? results[results.length - 1].published_at : null;

  return { articles: results, nextCursor };
}
```

### Offset Pagination (Good for Small/Medium Datasets)

```typescript
export async function getArticlesOffset(
  page: number,
  limit: number = 9,
): Promise<{ articles: Article[]; totalPages: number; totalCount: number }> {
  const offset = (page - 1) * limit;

  const [countResult, articles] = await Promise.all([
    sql<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM articles
      WHERE status = 'PUBLISHED' AND deleted_at IS NULL
    `,
    sql<Article[]>`
      SELECT *
      FROM articles
      WHERE status = 'PUBLISHED' AND deleted_at IS NULL
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
  ]);

  const totalCount = countResult[0].count;
  const totalPages = Math.ceil(totalCount / limit);

  return { articles, totalPages, totalCount };
}
```

---

## 11. Index Guidelines

### Critical Indexes for Karya Kata.

```sql
-- Article queries
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC)
  WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

-- Soft delete filtering (partial index)
CREATE INDEX idx_articles_active ON articles(id)
  WHERE deleted_at IS NULL;

-- Search queries
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('indonesian', title || ' ' || excerpt));

-- Foreign key indexes (automatically created by Neon, but explicit for clarity)
CREATE INDEX idx_comments_article ON comments(article_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_reactions_article ON reactions(article_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

---

## 12. Error Handling Patterns

### Model-Level Error Handling

```typescript
import { DatabaseError } from "@/lib/errors";

export async function createUser(data: CreateUserInput): Promise<User> {
  try {
    const [user] = await sql<User[]>`
      INSERT INTO users (name, email, password, role)
      VALUES (${data.name}, ${data.email}, ${data.password}, 'USER')
      RETURNING id, name, email, role, status, created_at
    `;
    return user;
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === "23505") {
      // PostgreSQL unique_violation
      throw new DatabaseError("Email already exists", "DUPLICATE_EMAIL");
    }
    throw new DatabaseError("Failed to create user", "CREATE_FAILED");
  }
}
```

---

## Summary Checklist

| Pattern                | When to Use                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| Tagged templates `${}` | All query parameters (auto-escaped)                                 |
| `sql.unsafe()`         | Never for user input; only for dynamic identifiers you've validated |
| JOIN queries           | When fetching related data in one query                             |
| JSON aggregation       | For one-to-many relationships (tags, comments)                      |
| Subqueries             | For computed counts/aggregations                                    |
| Transactions           | Multi-step operations (article + tags)                              |
| Soft delete            | `users`, `articles`, `comments` tables                              |
| Hard delete            | `reactions`, `bookmarks` (toggle behavior)                          |
| Cursor pagination      | Large datasets, infinite scroll                                     |
| Offset pagination      | Admin tables, predictable page sizes                                |

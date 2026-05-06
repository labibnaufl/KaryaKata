# Project Conventions — Karya Kata.

> File naming, folder structure, and code style conventions. Consistency is key for maintainability.

---

## 1. Folder Structure

### Complete Project Layout

```
D:\School\Semester 6\Prak Sistem Basis Data\Karya Kata.
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Example environment variables
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
├── public/                       # Static assets
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Route group: Authentication
│   │   │   ├── layout.tsx       # Auth pages layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── _lib/
│   │   │       ├── actions.ts   # Auth Server Actions
│   │   │       └── validations.ts
│   │   ├── (main)/              # Route group: Public site
│   │   │   ├── layout.tsx       # Main site layout
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── loading.tsx      # Homepage loading UI
│   │   │   ├── error.tsx        # Homepage error UI
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx     # Article listing
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── [slug]/      # Dynamic route
│   │   │   │   │   ├── page.tsx # Article detail
│   │   │   │   │   └── _components/
│   │   │   │   │       ├── article-content.tsx
│   │   │   │   │       ├── reaction-bar.tsx      # 'use client'
│   │   │   │   │       ├── bookmark-button.tsx   # 'use client'
│   │   │   │   │       ├── comment-section.tsx   # 'use client'
│   │   │   │   │       └── related-articles.tsx
│   │   │   │   └── _lib/
│   │   │   │       ├── actions.ts   # Article Server Actions
│   │   │   │       └── validations.ts
│   │   │   ├── bookmarks/
│   │   │   │   └── page.tsx
│   │   │   └── _components/     # Shared main components
│   │   │       ├── main-header.tsx
│   │   │       ├── main-footer.tsx
│   │   │       └── article-card.tsx
│   │   ├── (admin)/             # Route group: Admin
│   │   │   └── admin/
│   │   │       ├── layout.tsx   # Admin layout (sidebar)
│   │   │       ├── page.tsx     # Admin dashboard
│   │   │       ├── articles/
│   │   │       │   ├── page.tsx # Article management
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── [id]/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── _lib/
│   │   │       │       └── actions.ts
│   │   │       ├── categories/
│   │   │       │   └── page.tsx
│   │   │       └── tags/
│   │   │           └── page.tsx
│   │   ├── api/                  # API routes (rarely needed)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts     # Cloudinary upload
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── db.ts                # Neon SQL client
│   │   ├── utils.ts             # Utility functions
│   │   ├── auth.ts              # Auth.js configuration
│   │   ├── auth-utils.ts        # Auth helper functions
│   │   ├── cloudinary.ts        # Cloudinary client
│   │   └── validations.ts       # Shared Zod schemas
│   ├── models/                  # Data access layer (SQL)
│   │   ├── user.ts
│   │   ├── article.ts
│   │   ├── category.ts
│   │   ├── tag.ts
│   │   ├── comment.ts
│   │   ├── reaction.ts
│   │   ├── bookmark.ts
│   │   └── admin-log.ts
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── middleware.ts            # Next.js middleware
├── db/
│   ├── migrations/
│   │   └── 001_init.sql         # Database schema
│   └── seed.sql                 # Seed data
└── rules/                       # Documentation
    ├── implementation_plan.md
    ├── react-effects.md
    ├── raw-sql-patterns.md
    ├── mvc-architecture.md
    ├── next-server-client.md
    ├── project-conventions.md
    ├── auth-patterns.md
    ├── component-patterns.md
    └── nextjs-best-practice.md
```

---

## 2. Naming Conventions

### Files

| Type               | Convention                | Example                                 |
| ------------------ | ------------------------- | --------------------------------------- |
| Components (UI)    | PascalCase                | `Button.tsx`, `ArticleCard.tsx`         |
| Components (pages) | kebab-case                | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Utilities          | camelCase                 | `utils.ts`, `validations.ts`            |
| Models             | camelCase                 | `article.ts`, `user.ts`                 |
| Constants          | UPPER_SNAKE_CASE (values) | `MAX_RETRY_COUNT = 3`                   |
| Types/Interfaces   | PascalCase                | `Article`, `UserWithPosts`              |
| Server Actions     | camelCase + Action suffix | `createArticleAction`                   |
| React Hooks        | camelCase + use prefix    | `useAuth`, `useArticle`                 |

### Variables & Functions

```typescript
// ✅ CONSTANTS - UPPER_SNAKE_CASE
const MAX_ARTICLES_PER_PAGE = 9;
const DEFAULT_AVATAR = "/images/default-avatar.png";

// ✅ Types - PascalCase with descriptive names
interface ArticleWithAuthor extends Article {
  authorName: string;
  authorImage: string | null;
}

type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ✅ Functions - camelCase, descriptive verbs
async function fetchPublishedArticles() {}
function calculateReadTime(content: string): number {}
function formatDate(date: Date): string {}

// ✅ React Components - PascalCase
export function ArticleCard({ article }: ArticleCardProps) {}
export default function LoginPage() {}

// ✅ Boolean variables - is/has/should prefix
const isLoading = true;
const hasComments = comments.length > 0;
const shouldShowPreview = excerpt.length > 100;

// ✅ Event handlers - handle prefix
function handleSubmit() {}
function handleClick() {}
function handleInputChange() {}
```

### Database (SQL)

```sql
-- ✅ Tables - lowercase, plural
CREATE TABLE users ();
CREATE TABLE articles ();
CREATE TABLE article_tags ();  -- junction table

-- ✅ Columns - lowercase, snake_case
CREATE TABLE articles (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP  -- soft delete
);

-- ✅ Constraints - descriptive names
CONSTRAINT fk_articles_author
    FOREIGN KEY (author_id) REFERENCES users(id);

-- ✅ Indexes - descriptive prefix
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
```

---

## 3. Import Order

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";

// 2. Third-party libraries
import { z } from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// 3. Absolute imports (@/ aliases)
import { sql } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/models/article";
import type { Article } from "@/types";

// 4. Relative imports (same directory or subdirectories)
import { ArticleCard } from "./_components/article-card";
import { useArticleActions } from "./_lib/hooks";
import type { ArticleFormData } from "./_lib/types";

// 5. CSS imports (last)
import "./styles.css";
```

---

## 4. Component Structure

### Server Component Template

```tsx
// app/(main)/articles/page.tsx

// 1. Imports
import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/models/article";
import { ArticleList } from "./_components/article-list";
import { ArticleSkeleton } from "./_components/article-skeleton";

// 2. Metadata export (optional)
export const metadata: Metadata = {
  title: "Articles",
  description: "Browse all articles",
};

// 3. Revalidation (ISR)
export const revalidate = 3600;

// 4. Main component (async for data fetching)
interface ArticlesPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const category = params.category;

  // 5. Data fetching
  const articles = await getPublishedArticles(page, 9, category);

  // 6. Render
  return (
    <main className="container mx-auto py-8">
      <h1>Articles</h1>
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleList articles={articles} />
      </Suspense>
    </main>
  );
}
```

### Client Component Template

```tsx
// app/(main)/articles/_components/reaction-bar.tsx

// 1. Directive (FIRST LINE)
"use client";

// 2. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "../_lib/actions";

// 3. Types
interface ReactionBarProps {
  articleId: string;
  initialLikes: number;
  initialDislikes: number;
}

// 4. Component
export function ReactionBar({
  articleId,
  initialLikes,
  initialDislikes,
}: ReactionBarProps) {
  // 5. State
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isPending, setIsPending] = useState(false);

  // 6. Event handlers
  async function handleReaction(type: "LIKE" | "DISLIKE") {
    setIsPending(true);
    await toggleReaction(articleId, type);
    // Optimistic update...
    setIsPending(false);
  }

  // 7. Render
  return (
    <div className="flex gap-2">
      <Button onClick={() => handleReaction("LIKE")}>👍 {likes}</Button>
      <Button onClick={() => handleReaction("DISLIKE")}>👎 {dislikes}</Button>
    </div>
  );
}
```

---

## 5. TypeScript Strictness

### Enable Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Patterns

```typescript
// ✅ Explicit return types on public functions
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithAuthor | null> {
  // ...
}

// ✅ Null/undefined handling
const article = await getArticleBySlug(slug);
if (!article) {
  notFound(); // or return null
}
// Now article is ArticleWithAuthor, not null

// ✅ Discriminated unions for results
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

// ✅ Interface extension for related data
interface Article {
  id: string;
  title: string;
  // ... base fields
}

interface ArticleWithAuthor extends Article {
  authorName: string;
  authorImage: string | null;
}

interface ArticleFull extends ArticleWithAuthor {
  comments: Comment[];
  tags: Tag[];
}
```

---

## 6. Error Handling

### Try-Catch Pattern

```typescript
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  console.error("Operation failed:", error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      errors: error.flatten().fieldErrors,
    };
  }

  if (error.code === "23505") {
    // PostgreSQL unique violation
    return {
      success: false,
      error: "This record already exists",
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
  };
}
```

### Expected Errors (useActionState)

```tsx
// Server Action with expected errors
export async function createArticleAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Validation errors are expected - return them, don't throw
  const parseResult = schema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.flatten().fieldErrors,
    };
  }
  // ...
}
```

---

## 7. Comments Style

```typescript
// ✅ JSDoc for public APIs
/**
 * Fetches a published article by its unique slug.
 * Returns null if not found or article is not published/deleted.
 *
 * @param slug - The URL-friendly article identifier
 * @returns Article with author info, or null
 */
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithAuthor | null> {
  // ...
}

// ✅ Inline comments for complex logic
// Calculate estimated read time based on word count
// Average reading speed: 200 words per minute
const wordCount = content.split(/\s+/).length;
const readTime = Math.ceil(wordCount / 200);

// ✅ Section separators in large files
// ============================================================
// USER QUERIES
// ============================================================

// ============================================================
// USER MUTATIONS
// ============================================================
```

---

## 8. Environment Variables

```bash
# .env.example - Template for required variables

# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Auth.js
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

```typescript
// Access pattern
const dbUrl = process.env.DATABASE_URL;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// ❌ Never use process.env in Client Components unless NEXT_PUBLIC_
```

---

## Summary Checklist

| Convention        | Rule                                                |
| ----------------- | --------------------------------------------------- |
| Folders           | `kebab-case` for routes, `camelCase` for lib/models |
| Components        | `PascalCase` for UI, `kebab-case` for files         |
| Functions         | `camelCase`, verb prefix for actions                |
| Booleans          | `is`/`has`/`should` prefix                          |
| Database          | `snake_case` for tables/columns                     |
| Constants         | `UPPER_SNAKE_CASE` for values                       |
| Imports           | Ordered: React → 3rd party → @/ → relative → CSS    |
| Types             | Explicit return types, interfaces over types        |
| Client Components | `'use client'` first line, keep small               |

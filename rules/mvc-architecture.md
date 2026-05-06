# MVC Architecture Rules — Karya Kata.

> Strict separation of concerns: **Model** (data access), **View** (React components), **Controller** (Server Actions). No exceptions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW                                │
│                    (React Components)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   (main)/*   │  │  (auth)/*    │  │  (admin)/*   │      │
│  │ Public pages │  │ Login/Reg    │  │ CMS pages    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                          │
                    ┌─────▼──────┐
                    │ CONTROLLER │
                    │  Server    │
                    │  Actions   │
                    └─────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼──────┐  ┌─────▼──────┐  ┌────▼───────┐
    │   Model    │  │    Auth    │  │  External  │
    │   (SQL)    │  │  (NextAuth)│  │(Cloudinary)│
    └────────────┘  └────────────┘  └────────────┘
```

---

## 1. MODEL Layer Rules

### Location

```
src/models/
├── user.ts
├── article.ts
├── category.ts
├── tag.ts
├── comment.ts
├── reaction.ts
├── bookmark.ts
└── admin-log.ts
```

### Responsibilities

- ✅ **PURE data access functions only**
- ✅ Raw SQL queries using `@neondatabase/serverless`
- ✅ No business logic (no validation, no auth checks)
- ✅ No side effects (no logging, no notifications)
- ✅ Return typed data only

### Function Naming Convention

```typescript
// Queries (SELECT)
findUserByEmail(email: string)     // Single item lookup
findUserById(id: string)           // Single item by PK
getAllUsers(page, limit)           // List with pagination
getPublishedArticles(...)          // Domain-specific queries
getArticleBySlug(slug: string)     // Unique identifier lookup

// Mutations (INSERT/UPDATE/DELETE)
createUser(data: CreateUserInput)  // INSERT
updateUser(id, data)               // UPDATE
softDeleteUser(id)                 // Soft delete
hardDeleteUser(id)                 // Hard delete
restoreUser(id)                    // Restore soft-deleted

// Specialized operations
incrementViewCount(articleId)      // Counter updates
toggleReaction(...)                // Complex mutations
syncArticleTags(articleId, tags)   // Junction table sync
```

### Model Function Example

```typescript
// ✅ CORRECT: Pure data access, no business logic
// src/models/article.ts
import { sql } from "@/lib/db";
import type { Article, ArticleWithAuthor } from "@/types";

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithAuthor | null> {
  const result = await sql<ArticleWithAuthor[]>`
    SELECT a.*, u.name as author_name
    FROM articles a
    JOIN users u ON a.author_id = u.id
    WHERE a.slug = ${slug} AND a.deleted_at IS NULL
    LIMIT 1
  `;
  return result[0] ?? null;
}

// ✅ CORRECT: Returns data, no validation
export async function createArticle(
  data: CreateArticleInput,
): Promise<{ id: string }> {
  const [article] = await sql<{ id: string }[]>`
    INSERT INTO articles (title, slug, body, author_id, status)
    VALUES (${data.title}, ${data.slug}, ${data.body}, ${data.authorId}, 'DRAFT')
    RETURNING id
  `;
  return article;
}
```

---

## 2. CONTROLLER Layer Rules

### Location

```
src/app/
├── (auth)/
│   └── _lib/
│       └── actions.ts          # Auth controllers
├── (main)/
│   └── articles/
│       └── _lib/
│           └── actions.ts      # Public article controllers
├── (admin)/
│   └── admin/
│       └── articles/
│           └── _lib/
│               └── actions.ts  # Admin controllers
```

### Responsibilities

- ✅ **Business logic only**
- ✅ Input validation (Zod schemas)
- ✅ Authentication & authorization checks
- ✅ Call Model functions
- ✅ Return structured results (success/error)
- ✅ Side effects (logging, notifications)

### Server Action Pattern

```typescript
"use server";

// ✅ CORRECT: Controller with all responsibilities
// src/app/(main)/articles/_lib/actions.ts

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getArticleBySlug, incrementViewCount } from "@/models/article";
import { requireAuth } from "@/lib/auth-utils";
import { createLog } from "@/models/admin-log";

const ViewArticleSchema = z.object({
  slug: z.string().min(1),
});

export type ViewArticleResult =
  | { success: true; data: ArticleWithAuthor }
  | { success: false; error: string };

export async function viewArticle(
  formData: FormData,
): Promise<ViewArticleResult> {
  // 1. Validate input (Controller responsibility)
  const parseResult = ViewArticleSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parseResult.success) {
    return { success: false, error: "Invalid slug" };
  }

  const { slug } = parseResult.data;

  // 2. Check auth if needed (Controller responsibility)
  // Public articles don't require auth

  try {
    // 3. Call Model for data access
    const article = await getArticleBySlug(slug);

    if (!article) {
      return { success: false, error: "Article not found" };
    }

    // 4. Additional business logic
    await incrementViewCount(article.id);

    // 5. Side effects (logging)
    await createLog("SYSTEM", "ARTICLE_VIEWED", `Article ${slug} viewed`);

    // 6. Revalidate cache if needed
    revalidatePath(`/articles/${slug}`);

    return { success: true, data: article };
  } catch (error) {
    console.error("View article error:", error);
    return { success: false, error: "Failed to load article" };
  }
}
```

### Admin Controller with Authorization

```typescript
"use server";

// src/app/(admin)/admin/articles/_lib/actions.ts

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createArticle,
  updateArticle,
  softDeleteArticle,
} from "@/models/article";
import { requireAdmin } from "@/lib/auth-utils";
import { createLog } from "@/models/admin-log";

const CreateArticleSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  excerpt: z.string().max(2000).optional(),
  body: z.string().min(1),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type CreateArticleResult =
  | { success: true; articleId: string }
  | { success: false; errors: Record<string, string[]> };

export async function createArticleAction(
  prevState: CreateArticleResult | null,
  formData: FormData,
): Promise<CreateArticleResult> {
  // 1. REQUIRE admin role (Controller auth check)
  const user = await requireAdmin();

  // 2. Validate input
  const parseResult = CreateArticleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId") || undefined,
    tagIds: JSON.parse((formData.get("tagIds") as string) || "[]"),
    status: formData.get("status"),
  });

  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data = parseResult.data;

  try {
    // 3. Business logic: generate excerpt if not provided
    const excerpt = data.excerpt || generateExcerpt(data.body);

    // 4. Call Model
    const article = await createArticle({
      ...data,
      excerpt,
      authorId: user.id,
    });

    // 5. Side effects
    await createLog(user.id, "ARTICLE_CREATED", `Created: ${data.title}`);

    // 6. Revalidate
    revalidatePath("/articles");
    revalidatePath("/admin/articles");

    return { success: true, articleId: article.id };
  } catch (error) {
    console.error("Create article error:", error);
    return {
      success: false,
      errors: { _form: ["Failed to create article"] },
    };
  }
}
```

---

## 3. VIEW Layer Rules

### Location

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx            # Login view
│   └── register/
│       └── page.tsx            # Register view
├── (main)/
│   ├── page.tsx                # Homepage view
│   ├── layout.tsx              # Main layout
│   └── articles/
│       ├── page.tsx            # Article list view
│       ├── [slug]/
│       │   └── page.tsx        # Article detail view
│       └── _components/       # View-specific components
├── (admin)/
│   └── admin/
│       ├── page.tsx            # Admin dashboard view
│       └── articles/
│           ├── page.tsx        # Article management view
│           └── _components/   # Admin components
```

### Responsibilities

- ✅ Render UI based on props/data
- ✅ Capture user input
- ✅ Call Controller (Server Actions) for mutations
- ✅ Handle loading/error states
- ✅ NO direct Model calls
- ✅ NO business logic

### View Pattern: Server Component

```typescript
// ✅ CORRECT: Server Component View
// src/app/(main)/articles/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles } from '@/models/article';
import { getCommentsByArticle } from '@/models/comment';
import { ArticleDetail } from './_components/article-detail';
import { CommentSection } from './_components/comment-section';
import { RelatedArticles } from './_components/related-articles';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // 1. Server Component can call Model directly for initial data
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // 2. Parallel data fetching (no waterfalls)
  const [comments, related] = await Promise.all([
    getCommentsByArticle(article.id),
    getRelatedArticles(article.categoryId, article.id),
  ]);

  // 3. Render View with data
  return (
    <article>
      <ArticleDetail article={article} />
      <CommentSection articleId={article.id} initialComments={comments} />
      <RelatedArticles articles={related} />
    </article>
  );
}
```

### View Pattern: Client Component (Interactivity)

```typescript
// ✅ CORRECT: Client Component for interactivity
// src/app/(main)/articles/[slug]/_components/comment-section.tsx

'use client';

import { useState } from 'react';
import { postComment } from '../_lib/actions';
import { useSession } from 'next-auth/react';

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
}

export function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!session?.user) return;

    setIsPending(true);

    // Call Controller (Server Action)
    const result = await postComment(formData);

    if (result.success) {
      setComments(prev => [...prev, result.data]);
    }

    setIsPending(false);
  }

  return (
    <section>
      <h2>Comments</h2>
      {/* Render View only */}
    </section>
  );
}
```

---

## 4. Cross-Layer Communication Rules

### Data Flow

```
User Action → View (Component)
              ↓
          Controller (Server Action)
              ↓
          Model (SQL Query)
              ↓
          Database
              ↓
          Model (Return Data)
              ↓
          Controller (Return Result)
              ↓
          View (Update UI)
```

### Forbidden Patterns

**❌ Model calling Controller:**

```typescript
// NEVER DO THIS
// src/models/article.ts
import { sendNotification } from "@/app/_lib/actions"; // ❌ WRONG

export async function createArticle(data) {
  const result = await sql`...`;
  await sendNotification(result.id); // ❌ Model has side effects
  return result;
}
```

**❌ View calling Model directly:**

```typescript
// NEVER DO THIS in Client Components
// src/app/(main)/articles/_components/some-component.tsx
"use client";
import { createArticle } from "@/models/article"; // ❌ WRONG

export function SomeComponent() {
  // Client components must use Server Actions (Controller)
  async function handleClick() {
    await createArticle(data); // ❌ Won't work, bypasses validation/auth
  }
}
```

**❌ Controller bypassing validation:**

```typescript
// NEVER DO THIS
export async function createArticleAction(formData: FormData) {
  // ❌ No validation
  await createArticle({
    title: formData.get("title"), // ❌ No type checking
    // ...
  });
}
```

---

## 5. File Naming Conventions

### Models

```
user.ts           # Singular, lowercase
article.ts
comment.ts
```

### Views (Pages)

```
page.tsx          # Route page
layout.tsx        # Route layout
loading.tsx       # Loading UI
error.tsx         # Error UI
not-found.tsx     # 404 UI
```

### View Components

```
article-card.tsx         # kebab-case
comment-section.tsx
article-form.tsx
```

### Controllers (Server Actions)

```
actions.ts              # Default name
validations.ts          # Zod schemas (if large)
```

---

## 6. Type Safety Across Layers

### Shared Types

```typescript
// src/types/index.ts

// Database entity types (what Model returns)
export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  image: string | null;
  bio: string | null;
  createdAt: Date;
}

// Extended types (JOIN results)
export interface ArticleWithAuthor extends Article {
  authorName: string;
  authorImage: string | null;
  categoryName: string | null;
  tags: Tag[];
}

// Form input types (what Controller validates)
export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  authorId: string;
  categoryId?: string;
  tagIds: string[];
  status: "DRAFT" | "PUBLISHED";
}

// Action result types (what Controller returns)
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };
```

---

## 7. Testing Approach

### Model Tests

```typescript
// Test pure SQL functions
// Tests run against test database

describe("Article Model", () => {
  it("should create article with valid data", async () => {
    const result = await createArticle(mockData);
    expect(result.id).toBeDefined();
  });
});
```

### Controller Tests

```typescript
// Test business logic, validation, auth

describe("createArticleAction", () => {
  it("should reject invalid data", async () => {
    const result = await createArticleAction(null, invalidFormData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should reject non-admin users", async () => {
    // Mock non-admin session
    const result = await createArticleAction(null, validFormData);
    expect(result.success).toBe(false);
  });
});
```

---

## Summary Checklist

| Layer          | Do ✅                                                          | Don't ❌                                       |
| -------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| **Model**      | Raw SQL, type-safe queries, return data                        | Business logic, validation, auth, side effects |
| **Controller** | Validation, auth, business logic, side effects, return results | Direct DB access, bypass validation            |
| **View**       | Render UI, capture input, call Controller                      | Direct Model access, business logic            |

**Remember:**

1. Model = What data (SQL queries)
2. Controller = What to do with data (business logic)
3. View = How to present data (React components)

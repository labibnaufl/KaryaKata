# Next.js Server & Client Components Rules — Karya Kata.

> Clear boundaries between Server Components and Client Components. Maximize Server Components, minimize Client Components.

---

## 1. Component Type Decision Tree

```
Need interactivity?
│
├─ YES (state, effects, event handlers, browser APIs)
│  └─ Use Client Component
│     ├─ Add 'use client' directive at top
│     ├─ Keep as small as possible
│     └─ Extract static parts to Server Components
│
└─ NO (display data, static UI, SEO content)
   └─ Use Server Component (default)
      ├─ Fetch data directly from Models
      ├─ Access backend resources directly
      └─ Zero JavaScript sent to client
```

---

## 2. Server Components (Default)

### When to Use

- ✅ Fetching initial data from database
- ✅ Accessing backend resources (files, models)
- ✅ SEO-critical content (article content, metadata)
- ✅ Static UI elements (header, footer, layouts)
- ✅ Passing data to Client Components as props

### Patterns

**✅ Direct Model Access:**

```tsx
// src/app/(main)/articles/page.tsx
// NO 'use client' directive = Server Component

import { getPublishedArticles } from "@/models/article";
import { ArticleCard } from "./_components/article-card";

export default async function ArticlesPage() {
  // Server Component calls Model directly
  const articles = await getPublishedArticles(1, 9);

  return (
    <main>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </main>
  );
}
```

**✅ Parallel Data Fetching (No Waterfalls):**

```tsx
// src/app/(main)/articles/[slug]/page.tsx

import { getArticleBySlug } from "@/models/article";
import { getCommentsByArticle } from "@/models/comment";
import { getRelatedArticles } from "@/models/article";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Parallel fetching - no waterfalls!
  const [comments, related] = await Promise.all([
    getCommentsByArticle(article.id),
    getRelatedArticles(article.categoryId, article.id),
  ]);

  return (
    <article>
      <ArticleContent article={article} />
      <CommentSection
        articleId={article.id}
        initialComments={comments} // Pass data to Client Component
      />
      <RelatedArticles articles={related} />
    </article>
  );
}
```

**✅ Generate Metadata:**

```tsx
// Server Components can export metadata
import type { Metadata } from "next";
import { getArticleBySlug } from "@/models/article";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}
```

**✅ Generate Static Params (ISR):**

```tsx
// Pre-generate popular pages at build time
import { getPopularSlugs } from "@/models/article";

export async function generateStaticParams() {
  const slugs = await getPopularSlugs(100);

  return slugs.map((slug) => ({
    slug,
  }));
}

// Incremental Static Regeneration
export const revalidate = 3600; // Revalidate every hour
```

---

## 3. Client Components (Interactive)

### When to Use

- ✅ State management (useState, useReducer)
- ✅ Browser event handlers (onClick, onSubmit)
- ✅ Browser-only APIs (localStorage, navigator)
- ✅ React hooks (useEffect, useContext)
- ✅ Form interactivity with react-hook-form
- ✅ Real-time updates (WebSocket)

### Required Directive

```tsx
// First line MUST be 'use client'
"use client";

import { useState } from "react";

export function CommentForm({ articleId }: { articleId: string }) {
  const [content, setContent] = useState("");

  // Event handlers need Client Component
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await postComment({ articleId, content });
    setContent("");
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Keep Client Components Small

**❌ Bad — Entire page as Client Component:**

```tsx
"use client"; // ❌ Too broad

import { useState } from "react";

export default function ArticlePage({ article }) {
  // Everything is client-side now
  // SEO broken, performance degraded
}
```

**✅ Good — Extract only interactive parts:**

```tsx
// Server Component (page.tsx)
export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);

  return (
    <article>
      <ArticleContent content={article.body} /> {/* Static - Server */}
      <ReactionBar articleId={article.id} /> {/* Interactive - Client */}
      <CommentSection articleId={article.id} /> {/* Interactive - Client */}
    </article>
  );
}

// Client Component (reaction-bar.tsx)
("use client");

export function ReactionBar({ articleId }: { articleId: string }) {
  const [reaction, setReaction] = useState(null);

  async function handleReaction(type: "LIKE" | "DISLIKE") {
    await toggleReaction(articleId, type);
    setReaction(type);
  }

  return (
    <div>
      <button onClick={() => handleReaction("LIKE")}>👍</button>
      <button onClick={() => handleReaction("DISLIKE")}>👎</button>
    </div>
  );
}
```

---

## 4. Passing Data: Server → Client

### Serialization Rules

**✅ Serializable Props:**

```tsx
// Server Component
const article = await getArticleBySlug(slug);

// ✅ Pass plain objects
<ClientComponent article={article} />

// ✅ Pass primitives
<ClientComponent count={5} isActive={true} />

// ✅ Pass arrays of serializable data
<ClientComponent comments={comments} />
```

**❌ Non-Serializable Props:**

```tsx
// ❌ Cannot pass functions from Server to Client
<ClientComponent onAction={async () => {}} />

// ❌ Cannot pass classes
<ClientComponent date={new Date()} />  // Will be stringified

// ❌ Cannot pass Maps/Sets
<ClientComponent map={new Map()} />
```

### Solution: Server Actions as Props

```tsx
// Server Component
import { toggleReaction } from "./_lib/actions";

export default async function Page() {
  // Pass Server Action to Client Component
  return <ReactionBar toggleReaction={toggleReaction} />;
}

// Client Component
("use client");

interface ReactionBarProps {
  toggleReaction: (type: "LIKE" | "DISLIKE") => Promise<void>;
}

export function ReactionBar({ toggleReaction }: ReactionBarProps) {
  async function handleClick(type: "LIKE" | "DISLIKE") {
    await toggleReaction(type); // Calls Server Action
  }

  return <button onClick={() => handleClick("LIKE")}>Like</button>;
}
```

---

## 5. 'use server' Server Actions

### Location Patterns

```
src/app/
├── (main)/
│   └── articles/
│       └── _lib/
│           └── actions.ts     # Article-related actions
├── (auth)/
│   └── _lib/
│       └── actions.ts         # Auth actions
└── (admin)/
    └── admin/
        └── articles/
            └── _lib/
                └── actions.ts # Admin article actions
```

### Server Action Pattern

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { toggleReaction as toggleReactionModel } from "@/models/reaction";
import { requireAuth } from "@/lib/auth-utils";

export async function toggleReaction(
  articleId: string,
  type: "LIKE" | "DISLIKE",
) {
  // Server Action can access:
  // - Database (Models)
  // - Auth session
  // - Backend resources

  const user = await requireAuth();

  await toggleReactionModel(articleId, user.id, type);

  revalidatePath(`/articles/${articleId}`);
}
```

### Inline Server Actions

```tsx
// Can define inline in Server Components
export default async function Page() {
  async function handleSubmit(formData: FormData) {
    "use server"; // Marks this function as Server Action

    await createArticle(formData);
    revalidatePath("/articles");
  }

  return <form action={handleSubmit}>{/* ... */}</form>;
}
```

---

## 6. Interleaving Pattern

### Server + Client Mix

```tsx
// Server Component (layout.tsx or page.tsx)
import { Suspense } from "react";
import { ArticleSkeleton } from "./_components/article-skeleton";

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);

  return (
    <div>
      {/* Static content - Server rendered */}
      <header>
        <h1>{article.title}</h1>
        <Author name={article.authorName} />
      </header>

      {/* Interactive - Client Component */}
      <ReactionBar articleId={article.id} />

      {/* Static - Server rendered */}
      <div dangerouslySetInnerHTML={{ __html: article.body }} />

      {/* Interactive with loading state */}
      <Suspense fallback={<CommentSkeleton />}>
        <CommentSection articleId={article.id} />
      </Suspense>
    </div>
  );
}
```

---

## 7. Form Handling

### Server Component Form (Simple)

```tsx
// Server Component with Server Action
// src/app/(auth)/login/page.tsx

import { login } from "./_lib/actions";

export default function LoginPage() {
  return (
    <form action={login}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Client Component Form (Complex Validation)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createArticle } from "./_lib/actions";

export function ArticleForm() {
  const form = useForm({
    resolver: zodResolver(articleSchema),
  });

  async function onSubmit(data: ArticleFormData) {
    const result = await createArticle(data);
    if (result.success) {
      router.push(`/articles/${result.slug}`);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Complex form with validation */}
    </form>
  );
}
```

---

## 8. Common Mistakes to Avoid

### ❌ useEffect for Initial Data Fetching

```tsx
"use client";

// ❌ WRONG: Fetching data in Client Component
export function ArticleList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then(setArticles);
  }, []);

  return <div>{/* ... */}</div>;
}
```

### ✅ Fetch in Server Component

```tsx
// ✅ CORRECT: Fetch in Server Component
export default async function ArticleListPage() {
  const articles = await getPublishedArticles(); // Direct model call

  return <ArticleList initialArticles={articles} />;
}
```

### ❌ Using 'use client' at Layout Level

```tsx
// src/app/(main)/layout.tsx
"use client"; // ❌ WRONG: Makes entire route client-side

export default function Layout({ children }) {
  return <div>{children}</div>;
}
```

### ✅ Keep Layouts Server Components

```tsx
// src/app/(main)/layout.tsx
// NO 'use client' - stays Server Component

import { MainHeader } from "./_components/main-header";

export default function MainLayout({ children }) {
  return (
    <>
      <MainHeader /> {/* Can have Client Component inside */}
      <main>{children}</main>
    </>
  );
}
```

---

## 9. Performance Optimizations

### Preload Pattern

```tsx
// Preload data before it's needed
import { preloadArticle } from "@/models/article";

export default async function ArticlePage({ params }) {
  // Start loading immediately
  const articlePromise = preloadArticle(params.slug);

  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <ArticleContent promise={articlePromise} />
      </Suspense>
    </div>
  );
}
```

### Third-Party Script Loading

```tsx
// Load non-critical scripts after hydration
import Script from "next/script";

export default function Page() {
  return (
    <>
      <div>Content</div>
      <Script
        src="https://analytics.com/script.js"
        strategy="afterInteractive" // Load after hydration
      />
    </>
  );
}
```

---

## Summary Checklist

| Scenario                  | Component Type   |
| ------------------------- | ---------------- |
| Static content, SEO       | Server Component |
| Initial data fetching     | Server Component |
| Database queries          | Server Component |
| Metadata generation       | Server Component |
| Event handlers            | Client Component |
| Browser APIs              | Client Component |
| State management          | Client Component |
| Form validation (complex) | Client Component |
| Third-party JS libraries  | Client Component |

**Remember:**

- Default to Server Components
- Add `'use client'` only when necessary
- Keep Client Components as small as possible
- Use `'use server'` for mutations
- Leverage `Suspense` for progressive loading

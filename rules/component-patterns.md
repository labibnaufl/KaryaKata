# Component Patterns — Karya Kata.

> Component design patterns, composition strategies, and best practices for React components in this project.

---

## 1. Component Categories

### Server Components (Default)

| Use Case      | Example                | Location                              |
| ------------- | ---------------------- | ------------------------------------- |
| Static Layout | Layout, Header, Footer | `app/(main)/layout.tsx`               |
| Data Fetching | Article listing        | `app/(main)/articles/page.tsx`        |
| SEO Content   | Article detail         | `app/(main)/articles/[slug]/page.tsx` |
| Metadata      | Head, OpenGraph        | `page.tsx` exports                    |

### Client Components (Interactive)

| Use Case           | Example                   | Directive      |
| ------------------ | ------------------------- | -------------- |
| Event Handlers     | Buttons, Forms            | `'use client'` |
| State Management   | Form state, UI state      | `'use client'` |
| Browser APIs       | localStorage, geolocation | `'use client'` |
| External Libraries | TipTap editor             | `'use client'` |

---

## 2. Component Composition

### Container/Presentational Pattern

```tsx
// Server Component (Container) - Data fetching
// src/app/(main)/articles/[slug]/page.tsx

import { getArticleBySlug } from "@/models/article";
import { ArticleContent } from "./_components/article-content";
import { ReactionBar } from "./_components/reaction-bar"; // Client

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);

  return (
    <article>
      <h1>{article.title}</h1>
      <ArticleContent html={article.body} />
      <ReactionBar
        articleId={article.id}
        initialReactions={article.reactions}
      />
    </article>
  );
}
```

### Compound Component Pattern

```tsx
// src/components/ui/card.tsx

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>{children}</div>
  );
}

function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

// Export as namespace
export const CardCompound = {
  Root: Card,
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
};
```

Usage:

```tsx
<CardCompound.Root>
  <CardCompound.Header>
    <CardCompound.Title>Article Title</CardCompound.Title>
  </CardCompound.Header>
  <CardCompound.Content>Content here</CardCompound.Content>
</CardCompound.Root>
```

---

## 3. Props Patterns

### Props with Defaults

```tsx
interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  showExcerpt?: boolean;
  showAuthor?: boolean;
}

export function ArticleCard({
  article,
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
}: ArticleCardProps) {
  // ...
}

// Usage
<ArticleCard article={article} />  // All defaults
<ArticleCard article={article} variant="compact" showExcerpt={false} />
```

### Props Spreading (HTML Attributes)

```tsx
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className,
  disabled,
  ...props // Spread rest to button element
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props} // All native button attributes
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

### Render Props (Flexible Content)

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {
                  col.render
                    ? col.render(item) // Custom render
                    : String(item[col.key]) // Default
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
<DataTable
  data={articles}
  columns={[
    { key: "title", header: "Title" },
    {
      key: "status",
      header: "Status",
      render: (article) => (
        <Badge variant={article.status === "PUBLISHED" ? "green" : "gray"}>
          {article.status}
        </Badge>
      ),
    },
  ]}
/>;
```

---

## 4. Form Patterns

### Uncontrolled Form (Simple)

```tsx
// Server Component form with Server Action
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

### Controlled Form (Complex)

```tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createArticle } from "./_lib/actions";

// Separate submit button for pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Article"}
    </button>
  );
}

export function ArticleForm() {
  const [content, setContent] = useState("");

  return (
    <form action={createArticle}>
      <input name="title" required />

      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input type="hidden" name="content" value={content} />

      <SubmitButton />
    </form>
  );
}
```

### Form with Validation (useActionState)

```tsx
"use client";

import { useActionState } from "react";
import { createArticle } from "./_lib/actions";

const initialState = {
  success: false,
  errors: {},
};

export function ArticleForm() {
  const [state, formAction, isPending] = useActionState(
    createArticle,
    initialState,
  );

  return (
    <form action={formAction}>
      <div>
        <input name="title" required />
        {state.errors?.title && (
          <p className="text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <textarea name="body" required />
        {state.errors?.body && (
          <p className="text-red-500">{state.errors.body[0]}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>

      {state.success && <p className="text-green-500">Created!</p>}
    </form>
  );
}
```

---

## 5. List Patterns

### List with Loading State

```tsx
// Server Component
import { Suspense } from "react";
import { ArticleList } from "./_components/article-list";
import { ArticleSkeleton } from "./_components/article-skeleton";

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticleSkeleton count={9} />}>
      <ArticleList />
    </Suspense>
  );
}

// ArticleList.tsx (Server Component)
async function ArticleList() {
  const articles = await getPublishedArticles();

  return (
    <div className="grid gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### Infinite Scroll (Client)

```tsx
"use client";

import { useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { loadMoreArticles } from "./_lib/actions";

export function InfiniteArticleList({ initialArticles }) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const newArticles = await loadMoreArticles(nextPage);

    if (newArticles.length === 0) {
      setHasMore(false);
    } else {
      setArticles((prev) => [...prev, ...newArticles]);
      setPage(nextPage);
    }
  }, [page]);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) loadMore();
    },
  });

  return (
    <>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
      {hasMore && <div ref={ref}>Loading...</div>}
    </>
  );
}
```

---

## 6. Modal Patterns

### Parallel Routes + Intercepting Routes

```
src/app/(main)/
├── @modal/                    # Parallel route slot
│   └── (.)articles/
│       └── [slug]/
│           └── page.tsx       # Modal content
├── articles/
│   └── [slug]/
│       └── page.tsx           # Full page
├── layout.tsx                 # Includes {children} and {modal}
└── default.tsx                # Fallback when no modal
```

```tsx
// layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal} {/* Renders when intercepted route matches */}
    </>
  );
}
```

```tsx
// @modal/(.)articles/[slug]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

export default function ArticleModal({ params }) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <ArticleContent slug={params.slug} />
    </Dialog>
  );
}
```

---

## 7. Error Handling

### Error Boundary

```tsx
// src/app/(main)/articles/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article page error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Page

```tsx
// src/app/(main)/articles/[slug]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2>Article Not Found</h2>
      <p>Could not find the requested article.</p>
      <Link href="/articles">View all articles</Link>
    </div>
  );
}
```

---

## 8. Optimistic UI Patterns

### Optimistic Update

```tsx
"use client";

import { useOptimistic } from "react";
import { toggleBookmark } from "./_lib/actions";

export function BookmarkButton({
  articleId,
  initialIsBookmarked,
}: {
  articleId: string;
  initialIsBookmarked: boolean;
}) {
  const [optimisticBookmark, addOptimisticBookmark] = useOptimistic(
    initialIsBookmarked,
    (state, newState: boolean) => newState,
  );

  async function handleClick() {
    const newState = !optimisticBookmark;

    // Optimistically update UI
    addOptimisticBookmark(newState);

    // Server action
    try {
      await toggleBookmark(articleId);
    } catch (error) {
      // Revert on error
      addOptimisticBookmark(!newState);
    }
  }

  return (
    <button onClick={handleClick}>{optimisticBookmark ? "🔖" : "🔖"}</button>
  );
}
```

---

## Summary

| Pattern          | Use When                                |
| ---------------- | --------------------------------------- |
| Server Component | Default - static content, data fetching |
| Client Component | Interactivity, browser APIs, state      |
| Composition      | Complex UI with multiple parts          |
| Render Props     | Flexible content rendering              |
| useActionState   | Forms with server validation            |
| useOptimistic    | Instant UI feedback for actions         |
| Suspense         | Streaming, progressive loading          |
| Parallel Routes  | Modals, complex layouts                 |
| Error Boundaries | Graceful error handling                 |

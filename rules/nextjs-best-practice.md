# Next.js Best Practices — Karya Kata.

> Comprehensive Next.js 16 best practices derived from official guidelines and Vercel engineering recommendations. Follow these for optimal performance, maintainability, and user experience.

---

## 1. Data Fetching Architecture

### Server Components First

**✅ Fetch in Server Components (default)**

```tsx
// app/articles/page.tsx - NO 'use client'
import { getPublishedArticles } from "@/models/article";

export default async function ArticlesPage() {
  // Direct database access - zero client JS
  const articles = await getPublishedArticles();

  return (
    <div>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

**❌ Avoid useEffect for initial data**

```tsx
"use client";

// ❌ WRONG: Client-side data fetching
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

### Eliminate Waterfalls (CRITICAL)

**❌ Sequential fetching (waterfall)**

```tsx
// ❌ BAD: Requests happen one after another
async function Dashboard() {
  const user = await getUser(); // 100ms
  const articles = await getArticles(); // 200ms (waits for user)
  const comments = await getComments(); // 150ms (waits for articles)
  // Total: 450ms
}
```

**✅ Parallel fetching**

```tsx
// ✅ GOOD: All requests start immediately
async function Dashboard() {
  const userPromise = getUser();
  const articlesPromise = getArticles();
  const commentsPromise = getComments();

  const [user, articles, comments] = await Promise.all([
    userPromise,
    articlesPromise,
    commentsPromise,
  ]);
  // Total: ~200ms (max of all)
}

// ✅ BEST: Independent components fetch own data
async function Dashboard() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile /> {/* Fetches its own data */}
      </Suspense>
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticleList /> {/* Fetches its own data */}
      </Suspense>
    </>
  );
}
```

---

## 2. Server Actions

### Use for Mutations

**✅ Server Actions for form submissions**

```tsx
// actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createArticle } from "@/models/article";

export async function submitArticle(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const article = await createArticle({ title, content });

  revalidatePath("/articles");
  redirect(`/articles/${article.slug}`);
}
```

```tsx
// page.tsx
import { submitArticle } from "./actions";

export default function CreatePage() {
  return (
    <form action={submitArticle}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Progressive Enhancement

**✅ Works without JavaScript**

- Forms submit normally if JS fails
- Server Actions provide fallback

**✅ useActionState for pending states**

```tsx
"use client";

import { useActionState } from "react";
import { submitArticle } from "./actions";

export function ArticleForm() {
  const [state, formAction, isPending] = useActionState(submitArticle, {
    success: false,
    errors: {},
  });

  return (
    <form action={formAction}>
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {state.errors?.title && <p>{state.errors.title}</p>}
    </form>
  );
}
```

---

## 3. Caching Strategies

### Revalidate Path

**✅ After mutations**

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateArticle(id: string, data: ArticleData) {
  await db.update("articles", id, data);

  // Revalidate specific paths
  revalidatePath(`/articles/${id}`);
  revalidatePath("/articles");

  // Or use tags
  revalidateTag(`article-${id}`);
}
```

### Time-based Revalidation (ISR)

**✅ Static generation with revalidation**

```tsx
// Revalidate page every hour
export const revalidate = 3600;

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return <ArticleList articles={articles} />;
}
```

### Dynamic with On-Demand Revalidation

**✅ For frequently updated content**

```tsx
// Static at build, revalidate via webhook/API
export const dynamic = "force-static";

// Revalidate via API route or Server Action
export async function revalidateArticle(slug: string) {
  "use server";
  revalidatePath(`/articles/${slug}`);
}
```

---

## 4. Image Optimization

### Always Use next/image

**✅ Proper image usage**

```tsx
import Image from "next/image";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <div>
      <Image
        src={article.coverImage}
        alt={article.title}
        width={800}
        height={400}
        className="object-cover"
        priority={article.isFeatured} // LCP image
      />
    </div>
  );
}
```

**❌ Never use plain img for important images**

```tsx
// ❌ BAD: No optimization
<img src={article.coverImage} alt={article.title} />
```

### Responsive Images

**✅ Sizes attribute for responsive**

```tsx
<Image
  src={article.coverImage}
  alt={article.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Remote Images

**✅ Configure in next.config.ts**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/your-cloud/**",
      },
    ],
  },
};
```

---

## 5. Font Optimization

### Use next/font

**✅ Optimized font loading**

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevent FOIT
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

### Tailwind Integration

**✅ Font variable in Tailwind**

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans antialiased;
  }
}
```

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
};
```

---

## 6. Metadata & SEO

### Static Metadata

**✅ Simple static metadata**

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karya Kata. - Platform Artikel",
  description: "Platform artikel modern dengan sistem engagement lengkap",
  keywords: ["artikel", "blog", "platform", "indonesia"],
  authors: [{ name: "Karya Kata. Team" }],
  openGraph: {
    title: "Karya Kata.",
    description: "Platform artikel modern",
    type: "website",
    locale: "id_ID",
  },
};
```

### Dynamic Metadata

**✅ For dynamic pages**

```tsx
// app/articles/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage
        ? [
            {
              url: article.coverImage,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      type: "article",
      authors: [article.authorName],
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}
```

---

## 7. Route Handlers (When Needed)

### Server Actions Preferred

**✅ Use Server Actions for most mutations**

```typescript
"use server";

// Preferred over API routes
export async function uploadImage(formData: FormData) {
  // Handle upload
}
```

### When to Use Route Handlers

**✅ Webhooks, external APIs, non-React clients**

```tsx
// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  // Verify webhook
  // Process payment

  return NextResponse.json({ received: true });
}
```

**✅ File uploads with Cloudinary**

```tsx
// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${buffer.toString("base64")}`,
  );

  return NextResponse.json({ url: result.secure_url });
}
```

---

## 8. Bundle Optimization

### Dynamic Imports

**✅ Load heavy components on demand**

```tsx
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(
  () => import("@/components/tiptap-editor").then((m) => m.TipTapEditor),
  {
    ssr: false, // No SSR for editor
    loading: () => <EditorSkeleton />,
  },
);

export function ArticleForm() {
  return (
    <form>
      <TipTapEditor /> {/* Loaded on demand */}
    </form>
  );
}
```

### Import Directly (Avoid Barrel Files)

**❌ Barrel imports cause broad bundles**

```tsx
// ❌ BAD: Imports entire component library
import { Button, Card, Input } from "@/components/ui";
```

**✅ Direct imports enable tree-shaking**

```tsx
// ✅ GOOD: Only imports used components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

---

## 9. Error Handling

### Error Boundaries

**✅ Route-level error handling**

```tsx
// app/articles/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logErrorToService(error);
  }, [error]);

  return (
    <div className="error-page">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Global Error

**✅ Root error boundary**

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 10. Performance Checklist

### Before Deployment

- [ ] **Waterfalls eliminated** - All independent fetches use Promise.all()
- [ ] **Images optimized** - Using next/image with proper sizing
- [ ] **Fonts optimized** - Using next/font with display: swap
- [ ] **Bundle analyzed** - Run `npm run analyze` (if configured)
- [ ] **Dynamic imports** - Heavy components loaded on demand
- [ ] **Metadata complete** - All pages have titles, descriptions, OG tags
- [ ] **Caching configured** - ISR or revalidate strategies in place
- [ ] **Error boundaries** - error.tsx files for important routes
- [ ] **Loading states** - Suspense boundaries with loading.tsx
- [ ] **Core Web Vitals** - LCP < 2.5s, CLS < 0.1, FID < 100ms

### Performance Monitoring

**✅ Use Next.js Analytics**

```bash
# Enable in Vercel dashboard
# Or self-hosted with:
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Summary: Key Principles

| Principle                   | Implementation                         |
| --------------------------- | -------------------------------------- |
| **Server First**            | Default to Server Components           |
| **Parallel Fetch**          | Use Promise.all() for independent data |
| **Actions for Mutations**   | Use Server Actions over API routes     |
| **Optimize Images**         | Always use next/image                  |
| **Optimize Fonts**          | Use next/font                          |
| **Static Where Possible**   | Use generateStaticParams, ISR          |
| **Dynamic When Needed**     | Use dynamic imports for heavy code     |
| **Direct Imports**          | Avoid barrel files                     |
| **Progressive Enhancement** | Forms work without JS                  |
| **Error Boundaries**        | Handle errors gracefully               |
| **Metadata**                | SEO for every page                     |

---

## Quick Reference

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (interactive)
("use client");
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => {}}>Click</button>;
}

// Server Action (mutation)
("use server");
export async function action(formData: FormData) {
  await mutate(formData);
  revalidatePath("/");
}

// Parallel fetching
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ISR
export const revalidate = 3600;

// Image
<Image src="/img.jpg" width={800} height={400} alt="Desc" />;

// Font
const font = Inter({ subsets: ["latin"] });

// Metadata
export const metadata = { title: "Page" };
export async function generateMetadata({ params }) {
  return { title: "Dynamic" };
}
```

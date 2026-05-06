# Karya Kata. — Standalone Article Platform

A standalone article/writing platform for the **Database Systems Laboratory** final project. Built with Next.js, raw SQL (no ORM), and PostgreSQL (Neon). MVC architecture. Full engagement system.

---

## Lab Requirements Compliance

| #   | Requirement                    | How We Meet It                                                                    |
| --- | ------------------------------ | --------------------------------------------------------------------------------- |
| 1   | Web CRUD + 3-tier architecture | React (Client) → Server Actions (Server) → Neon PostgreSQL (Database)             |
| 2   | MVC pattern                    | `models/` (raw SQL) · React pages (View) · Server Actions (Controller)            |
| 3   | **No ORM — raw SQL only**      | `@neondatabase/serverless` with tagged template literals                          |
| 4   | ERD with 2+ actors             | **Reader** (browse, react, comment, bookmark) · **Admin** (manage content, users) |
| 5   | 3+ tables with constraints     | 10 tables with PKs, FKs, unique constraints, check constraints                    |
| 6   | Soft delete + hard delete      | `deleted_at TIMESTAMP` on articles/users/comments · hard `DELETE` on others       |
| 7   | JOIN queries (2+ tables)       | Articles JOIN users JOIN categories + subqueries for tags, reactions              |
| 8   | Search + auth/login            | `ILIKE` search on title/excerpt · Auth.js credentials + JWT                       |

---

## Tech Stack

| Layer           | Technology                     | Purpose                                                        |
| --------------- | ------------------------------ | -------------------------------------------------------------- |
| **Framework**   | Next.js 16 (App Router)        | SSR/ISR, routing, server actions                               |
| **Database**    | PostgreSQL (Neon)              | Data persistence                                               |
| **DB Driver**   | `@neondatabase/serverless`     | Raw SQL queries (tagged template literals, auto-parameterized) |
| **Auth**        | Auth.js v5 (Credentials + JWT) | Login, session, role-based access                              |
| **Rich Editor** | TipTap                         | WYSIWYG article editing                                        |
| **Image CDN**   | Cloudinary                     | Cover images, in-article images                                |
| **Validation**  | Zod                            | Form + server action validation                                |
| **Styling**     | Tailwind CSS v4 + shadcn/ui    | UI components                                                  |
| **Icons**       | Lucide React                   | Iconography                                                    |
| **Dates**       | date-fns (id locale)           | Date formatting                                                |
| **Password**    | bcryptjs                       | Password hashing                                               |

---

## MVC Architecture Mapping

```
src/
├── models/              ← MODEL (raw SQL query functions)
│   ├── user.ts
│   ├── article.ts
│   ├── category.ts
│   ├── tag.ts
│   ├── comment.ts
│   ├── reaction.ts
│   └── bookmark.ts
├── app/                 ← VIEW (React pages & components)
│   ├── (auth)/...
│   ├── (main)/...
│   └── (admin)/...
└── app/**/actions.ts    ← CONTROLLER (Server Actions = business logic)
    (or _lib/actions.ts per route group)
```

**Model** → Pure data access. Each file exports functions containing raw SQL. No business logic.
**View** → React components. Receives data, renders UI, captures user input.
**Controller** → Server Actions. Validates input, calls Model functions, handles auth, returns results to View.

---

## Database Schema — Raw SQL DDL

### Enums

```sql
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');
CREATE TYPE user_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED');
CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE reaction_type AS ENUM ('LIKE', 'DISLIKE');
```

### Tables (10 total)

```sql
-- ============================================================
-- 1. USERS (soft delete)
-- ============================================================
CREATE TABLE users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  image       TEXT,
  bio         TEXT,
  role        user_role NOT NULL DEFAULT 'USER',
  status      user_status NOT NULL DEFAULT 'PENDING',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMP  -- soft delete
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        VARCHAR(255) NOT NULL UNIQUE,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color       VARCHAR(7),  -- hex color for UI badge
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. ARTICLES (soft delete)
-- ============================================================
CREATE TABLE articles (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title            VARCHAR(500) NOT NULL,
  slug             VARCHAR(500) NOT NULL UNIQUE,
  excerpt          TEXT,
  body             TEXT NOT NULL,
  cover_image      TEXT,
  status           content_status NOT NULL DEFAULT 'DRAFT',
  view_count       INTEGER NOT NULL DEFAULT 0,
  read_time        INTEGER,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  keywords         TEXT,
  published_at     TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMP,  -- soft delete
  author_id        TEXT NOT NULL REFERENCES users(id),
  category_id      TEXT REFERENCES categories(id)
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_deleted ON articles(deleted_at);

-- ============================================================
-- 4. TAGS
-- ============================================================
CREATE TABLE tags (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       VARCHAR(255) NOT NULL UNIQUE,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. ARTICLE_TAGS (junction table)
-- ============================================================
CREATE TABLE article_tags (
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================
-- 6. COMMENTS (soft delete)
-- ============================================================
CREATE TABLE comments (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content    TEXT NOT NULL,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP  -- soft delete
);

-- ============================================================
-- 7. REACTIONS (hard delete only)
-- ============================================================
CREATE TABLE reactions (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type       reaction_type NOT NULL,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- ============================================================
-- 8. BOOKMARKS (hard delete only)
-- ============================================================
CREATE TABLE bookmarks (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- ============================================================
-- 9. ADMIN_LOGS
-- ============================================================
CREATE TABLE admin_logs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  action     VARCHAR(255) NOT NULL,
  details    TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Key SQL Constraints Inventory

| Constraint Type     | Where                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRIMARY KEY`       | All 9 tables                                                                                                                                                   |
| `FOREIGN KEY`       | articles→users, articles→categories, article_tags→articles/tags, comments→articles/users, reactions→articles/users, bookmarks→articles/users, admin_logs→users |
| `UNIQUE`            | users.email, categories.name/slug, tags.name/slug, articles.slug, reactions(article+user), bookmarks(article+user)                                             |
| `NOT NULL`          | All required fields                                                                                                                                            |
| `DEFAULT`           | UUIDs, timestamps, status enums, view_count                                                                                                                    |
| `ON DELETE CASCADE` | article_tags, comments, reactions, bookmarks                                                                                                                   |

### Soft Delete vs Hard Delete Strategy

| Table          | Strategy                | Rationale                            |
| -------------- | ----------------------- | ------------------------------------ |
| `users`        | **Soft** (`deleted_at`) | Preserve authored content references |
| `articles`     | **Soft** (`deleted_at`) | Content recovery, audit trail        |
| `comments`     | **Soft** (`deleted_at`) | Moderation trail                     |
| `reactions`    | **Hard** (`DELETE`)     | Toggle behavior, no audit needed     |
| `bookmarks`    | **Hard** (`DELETE`)     | Toggle behavior, no audit needed     |
| `article_tags` | **Hard** (`CASCADE`)    | Junction table, follows article      |
| `categories`   | **Hard**                | Admin-managed, rare deletion         |
| `tags`         | **Hard**                | Admin-managed, rare deletion         |
| `admin_logs`   | **Never deleted**       | Immutable audit trail                |

---

## Example JOIN Queries (Lab Requirement #7)

### 3-table JOIN: Articles with Author + Category

```sql
SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, a.status,
       a.view_count, a.read_time, a.published_at,
       u.name AS author_name, u.image AS author_image,
       c.name AS category_name, c.slug AS category_slug, c.color AS category_color
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'PUBLISHED' AND a.deleted_at IS NULL
ORDER BY a.published_at DESC
LIMIT 9 OFFSET 0;
```

### 4-table JOIN: Article detail with author + category + tags

```sql
SELECT a.*, u.name AS author_name, u.image AS author_image, u.bio AS author_bio,
       c.name AS category_name, c.slug AS category_slug, c.color AS category_color,
       COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
         FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE a.slug = $1 AND a.deleted_at IS NULL
GROUP BY a.id, u.name, u.image, u.bio, c.name, c.slug, c.color;
```

### 3-table JOIN: Comments with user info for an article

```sql
SELECT cm.id, cm.content, cm.created_at,
       u.id AS user_id, u.name AS user_name, u.image AS user_image
FROM comments cm
JOIN users u ON cm.user_id = u.id
JOIN articles a ON cm.article_id = a.id
WHERE cm.article_id = $1 AND cm.deleted_at IS NULL
ORDER BY cm.created_at ASC;
```

### Search with JOIN (Lab Requirement #8)

```sql
SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, a.published_at,
       u.name AS author_name, c.name AS category_name
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'PUBLISHED' AND a.deleted_at IS NULL
  AND (a.title ILIKE '%' || $1 || '%' OR a.excerpt ILIKE '%' || $1 || '%')
ORDER BY a.published_at DESC;
```

---

## Route Architecture

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (main)/
│   ├── page.tsx                    # Homepage
│   ├── articles/
│   │   ├── page.tsx                # Listing (ISR, filters, pagination, search)
│   │   ├── loading.tsx
│   │   ├── [slug]/page.tsx         # Detail (engagement, comments)
│   │   ├── _components/
│   │   └── _lib/actions.ts         # Controller
│   ├── bookmarks/page.tsx
│   └── layout.tsx
├── (admin)/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx                # Dashboard stats
│       ├── articles/
│       │   ├── page.tsx            # Management table
│       │   ├── new/page.tsx
│       │   ├── [id]/page.tsx
│       │   ├── _components/
│       │   └── _lib/actions.ts     # Controller
│       ├── categories/page.tsx
│       └── tags/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── upload/route.ts
└── layout.tsx
```

---

## Proposed Changes — Phase by Phase

### Phase 1: Project Scaffold & Database Setup

#### CLI Setup

```bash
npx -y create-next-app@latest ./ --yes --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
npx -y shadcn@latest init -y

npm install @neondatabase/serverless
npm install next-auth@beta
npm install bcryptjs zod date-fns lucide-react
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/pm
npm install cloudinary
npm install -D @types/bcryptjs

npx -y shadcn@latest add button input label card badge dialog table select textarea tabs separator dropdown-menu avatar alert sheet skeleton sonner
```

#### [NEW] `src/lib/db.ts`

- Neon serverless SQL client (singleton)
- `sql` tagged template function for parameterized queries

```typescript
import { neon } from "@neondatabase/serverless";
export const sql = neon(process.env.DATABASE_URL!);
```

#### [NEW] `db/migrations/001_init.sql`

- Full DDL as shown above (all 9 tables, enums, indexes)

#### [NEW] `db/seed.sql`

- Seed data: 1 super_admin, sample categories, tags, articles

#### [NEW] `src/lib/utils.ts`

- `cn()`, `slugify()`, `formatDate()`, `calculateReadTime()`, `truncateText()`

#### [NEW] `src/types/index.ts`

- TypeScript interfaces for all entities (Article, User, Category, etc.)
- Since no ORM, we define types manually

#### [NEW] `.env.example`

---

### Phase 2: Model Layer (Raw SQL)

All database interactions go here. Each file exports pure functions with raw SQL.

#### [NEW] `src/models/user.ts`

- `findUserByEmail(email)` — login lookup
- `findUserById(id)` — profile fetch
- `createUser(data)` — INSERT with hashed password
- `updateUser(id, data)` — UPDATE
- `softDeleteUser(id)` — SET deleted_at = NOW()
- `hardDeleteUser(id)` — DELETE FROM
- `getAllUsers()` — admin listing (WHERE deleted_at IS NULL)

#### [NEW] `src/models/article.ts`

- `getPublishedArticles(page, limit, categoryId?, search?)` — 3-table JOIN with pagination + search
- `getArticleBySlug(slug)` — 4-table JOIN (article + author + category + tags)
- `getFeaturedArticle()` — most-viewed published
- `getRelatedArticles(categoryId, excludeId)` — same category
- `createArticle(data)` — INSERT
- `updateArticle(id, data)` — UPDATE
- `softDeleteArticle(id)` — SET deleted_at = NOW()
- `hardDeleteArticle(id)` — DELETE FROM
- `restoreArticle(id)` — SET deleted_at = NULL
- `updateStatus(id, status)` — publish/archive/revert
- `incrementViewCount(id)` — UPDATE view_count = view_count + 1
- `getArticleStats()` — COUNT by status for admin dashboard
- `getAdminArticles(page, status?, search?)` — admin listing with author names

#### [NEW] `src/models/category.ts`

- `getAllCategories()` — with article count via subquery
- `getCategoryBySlug(slug)`
- `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`

#### [NEW] `src/models/tag.ts`

- `getAllTags()` — with usage count
- `createTag(data)`, `updateTag(id, data)`, `deleteTag(id)`
- `syncArticleTags(articleId, tagIds)` — DELETE old + INSERT new

#### [NEW] `src/models/comment.ts`

- `getCommentsByArticle(articleId)` — JOIN with users
- `createComment(data)` — INSERT
- `softDeleteComment(id)` — SET deleted_at = NOW()
- `hardDeleteComment(id)` — DELETE FROM

#### [NEW] `src/models/reaction.ts`

- `toggleReaction(articleId, userId, type)` — UPSERT or DELETE
- `getReactionCounts(articleId)` — COUNT grouped by type
- `getUserReaction(articleId, userId)` — current user's reaction

#### [NEW] `src/models/bookmark.ts`

- `toggleBookmark(articleId, userId)` — INSERT or DELETE
- `isBookmarked(articleId, userId)` — EXISTS check
- `getUserBookmarks(userId, page)` — JOIN with articles + authors

#### [NEW] `src/models/admin-log.ts`

- `createLog(userId, action, details)` — INSERT
- `getRecentLogs(limit)` — for admin dashboard

---

### Phase 3: Authentication (Controller + View)

#### [NEW] `src/auth.ts`

- Auth.js v5 config with Credentials provider
- `authorize()` calls `findUserByEmail()` from Model layer, compares bcrypt hash
- JWT strategy: store `id`, `role`, `status` in token
- Session callback: expose role & status

#### [NEW] `src/middleware.ts`

- Protect `/admin/*` → require ADMIN/SUPER_ADMIN
- Protect `/bookmarks` → require authenticated
- Redirect authenticated away from `/login`, `/register`

#### [NEW] `src/lib/auth-utils.ts`

- `requireAuth()`, `requireAdmin()`, `getCurrentUser()`

#### [NEW] `src/types/next-auth.d.ts`

- Type extensions for Session, JWT

#### [NEW] Auth Views

- `(auth)/layout.tsx` — centered card layout
- `(auth)/login/page.tsx` — email + password form
- `(auth)/register/page.tsx` — name, email, password, confirm

#### [NEW] Auth Controllers

- `(auth)/_lib/actions.ts` — `registerUser()`, `signInUser()`
- `(auth)/_lib/validations.ts` — Zod schemas

---

### Phase 4: Admin CMS (Controller + View)

#### Views

- `admin/layout.tsx` — sidebar navigation
- `admin/page.tsx` — dashboard stats (calls Model `getArticleStats()`)
- `admin/articles/page.tsx` — data table with filters
- `admin/articles/new/page.tsx` — create form
- `admin/articles/[id]/page.tsx` — edit form
- `admin/categories/page.tsx` — category CRUD
- `admin/tags/page.tsx` — tag CRUD

#### Components

- `ArticleForm.tsx` — TipTap editor, category select, tag multi-select, SEO fields, cover image upload
- `TipTapEditor.tsx` — WYSIWYG toolbar + extensions
- `ArticleStatusActions.tsx` — publish/archive/revert/delete buttons

#### Controllers

- `admin/articles/_lib/actions.ts` — `createArticle()`, `updateArticle()`, `publishArticle()`, `archiveArticle()`, `revertToDraft()`, `deleteArticle()` (soft), `permanentlyDeleteArticle()` (hard)
- `admin/categories/_lib/actions.ts` — CRUD actions
- `admin/tags/_lib/actions.ts` — CRUD actions

#### [NEW] `src/app/api/upload/route.ts` + `src/lib/cloudinary.ts`

- Cloudinary image upload endpoint

---

### Phase 5: Public Article System (Controller + View)

#### Views

- `(main)/layout.tsx` — header + footer + SessionProvider
- `(main)/_components/MainHeader.tsx` — logo, nav, auth-aware menu
- `(main)/_components/MainFooter.tsx` — branding, copyright
- `(main)/articles/page.tsx` — listing with filters, search, pagination (ISR)
- `(main)/articles/loading.tsx` — skeleton
- `(main)/articles/[slug]/page.tsx` — detail with engagement (ISR)

#### Components

- `ArticleCard.tsx`, `FeaturedArticle.tsx`, `ArticleFilters.tsx`, `PaginationControls.tsx`

#### Controllers

- `articles/_lib/actions.ts` — `fetchArticles()`, `fetchArticleBySlug()`, `incrementView()`, `searchArticles()`

---

### Phase 6: Engagement System

#### Views

- `[slug]/_components/ReactionBar.tsx` — like/dislike (optimistic UI)
- `[slug]/_components/BookmarkButton.tsx` — toggle (optimistic UI)
- `[slug]/_components/CommentSection.tsx` — list + form + delete
- `[slug]/_components/RelatedArticles.tsx` — same-category grid
- `bookmarks/page.tsx` — user's saved articles

#### Controllers

- `[slug]/_lib/actions.ts` — `toggleReaction()`, `toggleBookmark()`, `postComment()`, `deleteComment()` (soft), `removeComment()` (hard, admin only)
- `bookmarks/_lib/actions.ts` — `getUserBookmarks()`

---

### Phase 7: Homepage + Polish

- `(main)/page.tsx` — hero, featured article, latest grid, category showcase
- `not-found.tsx`, `error.tsx` — error pages
- Dark mode via `next-themes`, Inter font, responsive audit, sonner toasts

---

### Phase 8: Deployment

- SQL migration: `db/migrations/001_init.sql` run on Neon
- Seed data: `db/seed.sql` run on Neon
- Vercel: env variables, build command `next build`
- Verify all routes, auth, CRUD, soft/hard delete, JOINs, search

---

## ERD — Two Actors

```
┌─────────────┐         ┌──────────────┐
│   READER    │         │    ADMIN     │
│  (role=USER)│         │(role=ADMIN/  │
│             │         │ SUPER_ADMIN) │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ Browse, Search        │ All Reader actions PLUS:
       │ React (like/dislike)  │ Create/Edit/Delete Articles
       │ Comment               │ Manage Categories & Tags
       │ Bookmark              │ Publish/Archive lifecycle
       │ Register/Login        │ Soft delete + Hard delete
       │                       │ View admin dashboard
       │                       │ Audit logging
       ▼                       ▼
┌─────────────────────────────────────────┐
│              DATABASE                    │
│                                          │
│  users ──┬── articles ──┬── categories   │
│          │              ├── article_tags  │
│          │              │      └── tags   │
│          ├── comments   │                │
│          ├── reactions  │                │
│          ├── bookmarks  │                │
│          └── admin_logs                  │
└─────────────────────────────────────────┘
```

---

## Verification Plan

### Automated

```bash
npx tsc --noEmit          # Type check
npm run lint              # Lint
npm run build             # Full build validation
```

### Manual / Browser

| Test            | What to verify                                                          |
| --------------- | ----------------------------------------------------------------------- |
| Auth flow       | Register → Login → Session → Logout                                     |
| Admin guard     | Non-admin blocked from `/admin/*`                                       |
| Article CRUD    | Create → Edit → Publish → Archive → Soft Delete → Restore → Hard Delete |
| **Soft delete** | Soft-deleted articles hidden from public, visible in admin trash        |
| **Hard delete** | Permanently removes row from database                                   |
| **JOINs**       | Article listing shows author + category; detail shows tags too          |
| **Search**      | `ILIKE` search on title + excerpt returns correct results               |
| TipTap editor   | Rich text editing + image upload                                        |
| Engagement      | Reactions, bookmarks, comments (auth-gated)                             |
| Responsive      | Mobile, tablet, desktop                                                 |
| SEO             | OpenGraph + Twitter Cards on article pages                              |

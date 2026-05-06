-- ============================================================
-- Karya Kata. Database Schema
-- PostgreSQL (Neon) - Raw SQL DDL
-- ============================================================

-- ============================================================
-- 0. DROP TABLES (if recreating)
-- ============================================================
-- DROP TABLE IF EXISTS admin_logs CASCADE;
-- DROP TABLE IF EXISTS bookmarks CASCADE;
-- DROP TABLE IF EXISTS reactions CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS article_tags CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;
-- DROP TABLE IF EXISTS articles CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS user_role CASCADE;
-- DROP TYPE IF EXISTS user_status CASCADE;
-- DROP TYPE IF EXISTS content_status CASCADE;
-- DROP TYPE IF EXISTS reaction_type CASCADE;

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');
CREATE TYPE user_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE reaction_type AS ENUM ('LIKE', 'DISLIKE');

-- ============================================================
-- 2. USERS TABLE (soft delete)
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
  deleted_at  TIMESTAMP   -- soft delete marker
);

-- ============================================================
-- 3. CATEGORIES TABLE
-- ============================================================

CREATE TABLE categories (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        VARCHAR(255) NOT NULL UNIQUE,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color       VARCHAR(7),  -- hex color for UI badge (e.g., #FF5733)
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. ARTICLES TABLE (soft delete)
-- ============================================================

CREATE TABLE articles (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title            VARCHAR(500) NOT NULL,
  slug             VARCHAR(500) NOT NULL UNIQUE,
  excerpt          TEXT,                          -- auto-generated or manual
  body             TEXT NOT NULL,                 -- HTML content from TipTap
  cover_image      TEXT,                          -- Cloudinary URL
  status           content_status NOT NULL DEFAULT 'DRAFT',
  view_count       INTEGER NOT NULL DEFAULT 0,
  read_time        INTEGER,                       -- estimated minutes
  meta_title       VARCHAR(255),                  -- SEO
  meta_description TEXT,                          -- SEO
  keywords         TEXT,                          -- SEO, comma-separated
  published_at     TIMESTAMP,                     -- when published
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMP,                     -- soft delete marker
  author_id        TEXT NOT NULL REFERENCES users(id),
  category_id      TEXT REFERENCES categories(id)
);

-- Article indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_deleted ON articles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_articles_published ON articles(published_at DESC) 
  WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

-- ============================================================
-- 5. TAGS TABLE
-- ============================================================

CREATE TABLE tags (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       VARCHAR(255) NOT NULL UNIQUE,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ARTICLE_TAGS (junction table - many-to-many)
-- ============================================================

CREATE TABLE article_tags (
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);

-- ============================================================
-- 7. COMMENTS TABLE (soft delete)
-- ============================================================

CREATE TABLE comments (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content    TEXT NOT NULL,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP   -- soft delete marker
);

CREATE INDEX idx_comments_article ON comments(article_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user ON comments(user_id);

-- ============================================================
-- 8. REACTIONS TABLE (hard delete only - toggle behavior)
-- ============================================================

CREATE TABLE reactions (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type       reaction_type NOT NULL,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, user_id)  -- one reaction per user per article
);

CREATE INDEX idx_reactions_article ON reactions(article_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- ============================================================
-- 9. BOOKMARKS TABLE (hard delete only - toggle behavior)
-- ============================================================

CREATE TABLE bookmarks (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, user_id)  -- one bookmark per user per article
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article ON bookmarks(article_id);

-- ============================================================
-- 10. ADMIN_LOGS TABLE (immutable audit trail - never delete)
-- ============================================================

CREATE TABLE admin_logs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  action     VARCHAR(255) NOT NULL,
  details    TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_user ON admin_logs(user_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================================
-- SUMMARY: Delete Strategies
-- ============================================================
-- SOFT DELETE (deleted_at): users, articles, comments
-- HARD DELETE: reactions, bookmarks, article_tags, categories, tags
-- NEVER DELETE: admin_logs (audit trail)
-- ============================================================

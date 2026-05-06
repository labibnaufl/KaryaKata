-- ============================================================
-- KaryaKata Seed Data
-- Run this after 001_init.sql
-- ============================================================

-- ============================================================
-- 1. USERS (All passwords: "user123")
-- ============================================================

-- SUPER ADMIN
INSERT INTO users (id, name, email, password, role, status, bio)
VALUES (
  'admin-001',
  'Super Administrator',
  'superadmin@karyakata.id',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgOzt0rajG',
  'SUPER_ADMIN',
  'VERIFIED',
  'Platform administrator with full access'
);

-- ADMIN (Content Manager)
INSERT INTO users (id, name, email, password, role, status, bio, image)
VALUES (
  'admin-002',
  'Budi Santoso',
  'admin@karyakata.id',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgOzt0rajG',
  'ADMIN',
  'VERIFIED',
  'Content manager dan editor di KaryaKata',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi'
);

-- REGULAR USER (Verified Reader)
INSERT INTO users (id, name, email, password, role, status, bio, image)
VALUES (
  'user-001',
  'Dewi Kusuma',
  'verifieduser@karyakata.id',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgOzt0rajG',
  'USER',
  'VERIFIED',
  'Pembaca aktif dan penulis pemula',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi'
);

-- PENDING USER (Awaiting verification)
INSERT INTO users (id, name, email, password, role, status, bio)
VALUES (
  'user-002',
  'Ahmad Fauzi',
  'pendinguser@karyakata.id',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgOzt0rajG',
  'USER',
  'PENDING',
  'Menunggu verifikasi akun'
);

-- ============================================================
-- 2. SAMPLE CATEGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, color) VALUES
('cat-001', 'Teknologi', 'teknologi', 'Artikel tentang teknologi dan perkembangannya', '#3B82F6'),
('cat-002', 'Bisnis', 'bisnis', 'Tips dan strategi bisnis', '#10B981'),
('cat-003', 'Pendidikan', 'pendidikan', 'Artikel edukatif dan tutorial', '#F59E0B'),
('cat-004', 'Gaya Hidup', 'gaya-hidup', 'Lifestyle, kesehatan, dan hobi', '#EC4899'),
('cat-005', 'Kreativitas', 'kreativitas', 'Desain, seni, dan inspirasi kreatif', '#8B5CF6');

-- ============================================================
-- 3. SAMPLE TAGS
-- ============================================================

INSERT INTO tags (id, name, slug) VALUES
('tag-001', 'JavaScript', 'javascript'),
('tag-002', 'React', 'react'),
('tag-003', 'Next.js', 'nextjs'),
('tag-004', 'Database', 'database'),
('tag-005', 'Tutorial', 'tutorial'),
('tag-006', 'Tips', 'tips'),
('tag-007', 'Inspirasi', 'inspirasi'),
('tag-008', 'Pemula', 'pemula'),
('tag-009', 'Mahir', 'mahir'),
('tag-010', 'PostgreSQL', 'postgresql');

-- ============================================================
-- 4. SAMPLE ARTICLES
-- ============================================================

INSERT INTO articles (
  id, title, slug, excerpt, body, status, 
  read_time, view_count, published_at,
  author_id, category_id
) VALUES 
(
  'article-001',
  'Memahami PostgreSQL untuk Aplikasi Modern',
  'memahami-postgresql-untuk-aplikasi-modern',
  'Pelajari dasar-dasar PostgreSQL dan bagaimana menggunakannya dalam aplikasi web modern dengan performa tinggi.',
  '<p>PostgreSQL adalah salah satu sistem manajemen basis data relasional yang paling populer dan powerful di dunia. Dalam artikel ini, kita akan membahas:</p>
  <h2>Mengapa PostgreSQL?</h2>
  <p>PostgreSQL menawarkan berbagai keunggulan dibandingkan sistem database lainnya:</p>
  <ul>
    <li>Open source dan gratis</li>
    <li>Dukungan untuk JSON dan JSONB</li>
    <li>Full-text search built-in</li>
    <li>Extensible dengan berbagai extension</li>
  </ul>',
  'PUBLISHED',
  5,
  1250,
  NOW() - INTERVAL '3 days',
  'admin-001',
  'cat-001'
),
(
  'article-002',
  'Panduan Lengkap Next.js 16',
  'panduan-lengkap-nextjs-16',
  'Next.js 16 membawa berbagai fitur baru yang membuat pengembangan web lebih cepat dan efisien. Pelajari semuanya di sini.',
  '<p>Next.js 16 adalah versi terbaru dari framework React yang populer. Dengan Turbopack yang semakin stabil dan berbagai fitur baru, pengembangan aplikasi React menjadi lebih cepat dari sebelumnya.</p>
  <h2>Fitur Unggulan</h2>
  <p>Beberapa fitur yang patut dicoba:</p>
  <ul>
    <li>Turbopack - Bundler yang super cepat</li>
    <li>Server Actions yang lebih baik</li>
    <li>Caching yang lebih fleksibel</li>
    <li>Partial Prerendering (PPR)</li>
  </ul>',
  'PUBLISHED',
  8,
  890,
  NOW() - INTERVAL '5 days',
  'admin-001',
  'cat-001'
),
(
  'article-003',
  'Strategi Menulis Konten yang SEO-Friendly',
  'strategi-menulis-konten-yang-seo-friendly',
  'Tips dan trik menulis artikel yang ramah mesin pencari tanpa mengorbankan kualitas konten untuk pembaca.',
  '<p>SEO (Search Engine Optimization) adalah aspek penting dalam publikasi konten digital. Namun, kita harus ingat bahwa konten ditulis untuk manusia, bukan hanya untuk mesin pencari.</p>
  <h2>Prinsip Dasar</h2>
  <p>Beberapa prinsip yang perlu diperhatikan:</p>
  <ul>
    <li>Riset keyword yang relevan</li>
    <li>Struktur heading yang jelas</li>
    <li>Konten original dan berkualitas</li>
    <li>Meta description yang menarik</li>
  </ul>',
  'PUBLISHED',
  6,
  567,
  NOW() - INTERVAL '7 days',
  'admin-001',
  'cat-002'
);

-- ============================================================
-- 5. ARTICLE-TAG RELATIONSHIPS
-- ============================================================

INSERT INTO article_tags (article_id, tag_id) VALUES
('article-001', 'tag-004'),
('article-001', 'tag-010'),
('article-001', 'tag-008'),
('article-002', 'tag-003'),
('article-002', 'tag-002'),
('article-002', 'tag-001'),
('article-002', 'tag-005'),
('article-003', 'tag-006'),
('article-003', 'tag-007');

-- ============================================================
-- 6. SAMPLE COMMENTS (Mixed users)
-- ============================================================

INSERT INTO comments (id, content, article_id, user_id, created_at) VALUES
('comment-001', 'Artikel yang sangat membantu! Terima kasih.', 'article-001', 'user-001', NOW() - INTERVAL '2 days'),
('comment-002', 'Saya sudah mencoba Next.js 16 dan memang sangat cepat!', 'article-002', 'user-001', NOW() - INTERVAL '1 day'),
('comment-003', 'Tulisannya bagus, tapi bisa ditambahi contoh kode lebih banyak.', 'article-001', 'admin-002', NOW() - INTERVAL '1 day'),
('comment-004', 'Terima kasih untuk artikelnya, sangat bermanfaat!', 'article-003', 'user-001', NOW() - INTERVAL '12 hours');

-- ============================================================
-- 7. SAMPLE REACTIONS (Mixed users)
-- ============================================================

INSERT INTO reactions (id, type, article_id, user_id) VALUES
('react-001', 'LIKE', 'article-001', 'user-001'),
('react-002', 'LIKE', 'article-002', 'user-001'),
('react-003', 'LIKE', 'article-001', 'admin-002'),
('react-004', 'DISLIKE', 'article-002', 'admin-002'),
('react-005', 'LIKE', 'article-003', 'user-001');

-- ============================================================
-- 8. SAMPLE ADMIN LOGS
-- ============================================================

INSERT INTO admin_logs (id, action, details, user_id) VALUES
('log-001', 'SEED_DATA_LOADED', 'Initial seed data loaded successfully', 'admin-001');

-- ============================================================
-- 9. SAMPLE BOOKMARKS (User bookmarks)
-- ============================================================

INSERT INTO bookmarks (id, article_id, user_id, created_at) VALUES
('bookmark-001', 'article-001', 'user-001', NOW() - INTERVAL '1 day'),
('bookmark-002', 'article-003', 'user-001', NOW() - INTERVAL '6 hours'),
('bookmark-003', 'article-002', 'admin-002', NOW() - INTERVAL '12 hours');

-- ============================================================
-- 10. ADMIN LOGS (Multiple admins)
-- ============================================================

INSERT INTO admin_logs (id, action, details, user_id, created_at) VALUES
('log-005', 'SEED_DATA_LOADED', 'Additional seed data loaded', 'admin-001', NOW()),
('log-002', 'ARTICLE_PUBLISHED', 'Published: Memahami PostgreSQL untuk Aplikasi Modern', 'admin-001', NOW() - INTERVAL '3 days'),
('log-003', 'ARTICLE_PUBLISHED', 'Published: Panduan Lengkap Next.js 16', 'admin-001', NOW() - INTERVAL '5 days'),
('log-004', 'ARTICLE_PUBLISHED', 'Published: Strategi Menulis Konten yang SEO-Friendly', 'admin-002', NOW() - INTERVAL '7 days');

-- ============================================================
-- COMPLETE
-- ============================================================
-- LOGIN CREDENTIALS (all passwords: user123)
-- 
-- SUPER_ADMIN:
--   Email: superadmin@karyakata.id
--   Password: user123
--
-- ADMIN:
--   Email: budi@karyakata.id
--   Password: user123
--
-- VERIFIED USER:
--   Email: dewi@karyakata.id
--   Password: user123
--
-- PENDING USER:
--   Email: ahmad@karyakata.id
--   Password: user123
-- ============================================================

// ============================================================
// ENUM TYPES (from PostgreSQL)
// ============================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type UserStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ReactionType = 'LIKE' | 'DISLIKE';

// ============================================================
// DATABASE ENTITY TYPES
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  status: ContentStatus;
  viewCount: number;
  readTime: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  authorId: string;
  categoryId: string | null;
}

export interface ArticleTag {
  articleId: string;
  tagId: string;
}

export interface Comment {
  id: string;
  content: string;
  articleId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Reaction {
  id: string;
  type: ReactionType;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface AdminLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  userId: string;
  createdAt: Date;
}

// ============================================================
// EXTENDED TYPES (with JOIN data)
// ============================================================

export interface ArticleWithAuthor extends Article {
  authorName: string;
  authorImage: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
}

export interface ArticleFull extends ArticleWithAuthor {
  authorBio: string | null;
  tags: Tag[];
}

export interface CommentWithUser extends Comment {
  userName: string;
  userImage: string | null;
}

export interface CategoryWithCount extends Category {
  articleCount: number;
}

export interface TagWithCount extends Tag {
  articleCount: number;
}

export interface BookmarkWithArticle extends Bookmark {
  article: ArticleWithAuthor;
}

export interface ReactionCounts {
  likes: number;
  dislikes: number;
}

// ============================================================
// INPUT TYPES (for create/update operations)
// ============================================================

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  status?: ContentStatus;
  readTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  authorId: string;
  categoryId?: string;
}

export interface CreateCommentInput {
  content: string;
  articleId: string;
  userId: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

// ============================================================
// ACTION RESULT TYPES
// ============================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

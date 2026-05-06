"use server";

import { auth } from "@/lib/auth";
import { getAdminArticles as getAdminArticlesModel } from "@/models/article";
import { getAvailableTags as getAvailableTagsModel } from "@/models/tag";
import { getArticleStats as getArticleStatsModel } from "@/models/article";
import { getFilteredAdminLogs, getAdminLogFilters } from "@/models/admin-log";
import { getUserStats as getUserStatsModel, getAdminUsers } from "@/models/user";
import type { ContentStatus } from "@/types";

/**
 * Helper to verify admin authorization
 */
async function requireAdminAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get articles for admin listing with filters
 */
export async function getAdminArticles({
  status,
  category,
  search,
  page = 1,
}: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
}) {
  await requireAdminAction();

  const statusFilter = status || undefined;
  const searchQuery = search || undefined;
  const limit = 20;

  const [articles, stats] = await Promise.all([
    getAdminArticlesModel(
      page,
      limit,
      statusFilter as ContentStatus | undefined,
      searchQuery
    ),
    getArticleStatsModel(),
  ]);

  const totalCount = stats.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    articles: articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || null,
      coverImage: article.cover_image || null,
      category: article.category_name || "UMUM",
      status: article.status,
      views: article.view_count || 0,
      readTime: article.read_time || null,
      publishedAt: article.published_at || null,
      createdAt: article.created_at,
      author: { name: article.author_name || null },
      tags: [], // Tags loaded separately
    })),
    total: totalCount,
    stats: [
      { status: "DRAFT", _count: { id: stats.draft } },
      { status: "PUBLISHED", _count: { id: stats.published } },
      { status: "ARCHIVED", _count: { id: stats.archived } },
    ],
    totalPages,
  };
}

/**
 * Get all available tags for article form
 */
export async function getAvailableTags() {
  await requireAdminAction();
  
  const tags = await getAvailableTagsModel();
  return tags;
}

/**
 * Get all available categories for article form
 */
export async function getAvailableCategories() {
  await requireAdminAction();
  const { getAllCategories } = await import("@/models/category");
  return getAllCategories();
}

/**
 * Get admin logs with filters
 */
export async function getAdminLogs({
  action,
  entity,
  admin,
  page = 1,
}: {
  action?: string;
  entity?: string;
  admin?: string;
  page?: number;
}) {
  await requireAdminAction();

  const perPage = 25;

  const [logs, total, admins, actions] = await Promise.all([
    getFilteredAdminLogs({
      action,
      entity,
      adminId: admin,
      page,
      perPage,
    }),
    getAdminLogCount({ action, entity, adminId: admin }),
    getAdminLogAdmins(),
    getAdminLogActions(),
  ]);

  return {
    logs,
    total,
    admins,
    actions,
    totalPages: Math.ceil(total / perPage),
  };
}

// Helper to get total count
async function getAdminLogCount(filters: {
  action?: string;
  entity?: string;
  adminId?: string;
}): Promise<number> {
  const { getFilteredAdminLogsCount } = await import("@/models/admin-log");
  return getFilteredAdminLogsCount(filters);
}

// Helper to get unique admins
async function getAdminLogAdmins() {
  const { getAdminLogFilters } = await import("@/models/admin-log");
  return getAdminLogFilters();
}

// Helper to get unique actions
async function getAdminLogActions() {
  const { getAdminLogActions: getActions } = await import("@/models/admin-log");
  return getActions();
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getAdminDashboardStats() {
  await requireAdminAction();

  const { getArticleViewsByMonth } = await import("@/models/article-views");

  const [articleStats, userStats, recentLogs, pendingUsers, trafficData] = await Promise.all([
    getArticleStatsModel(),
    getUserStatsModel(),
    getFilteredAdminLogs({ page: 1, perPage: 5 }),
    getAdminUsers(1, 5, "PENDING"),
    getArticleViewsByMonth(6),
  ]);

  return {
    articles: {
      published: articleStats.published,
      draft: articleStats.draft,
      archived: articleStats.archived,
      total: articleStats.total,
    },
    users: {
      verified: userStats.verified,
      pending: userStats.pending,
      rejected: userStats.rejected,
      total: userStats.total,
    },
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
      userName: log.userName,
    })),
    pendingUsers: pendingUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })),
    trafficData,
  };
}

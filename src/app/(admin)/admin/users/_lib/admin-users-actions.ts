"use server";

import { auth } from "@/lib/auth";
import { getAdminUsers as getAdminUsersModel, getUserStats as getUserStatsModel } from "@/models/user";
import type { UserRole, UserStatus } from "@/types";

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
 * Get users for admin listing with filters
 */
export async function getAdminUsers({
  status,
  role,
  search,
  page = 1,
}: {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
}) {
  await requireAdminAction();

  const statusFilter = status || undefined;
  const roleFilter = role || undefined;
  const searchQuery = search || undefined;
  const limit = 20;

  const [users, stats] = await Promise.all([
    getAdminUsersModel(
      page,
      limit,
      statusFilter as UserStatus | undefined,
      roleFilter as UserRole | undefined,
      searchQuery
    ),
    getUserStatsModel(),
  ]);

  const totalCount = stats.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    })),
    total: totalCount,
    stats: [
      { status: "VERIFIED", count: stats.verified },
      { status: "PENDING", count: stats.pending },
      { status: "REJECTED", count: stats.rejected },
    ],
    totalPages,
  };
}

/**
 * Get user statistics
 */
export async function getUserStatsForAdmin() {
  await requireAdminAction();
  return getUserStatsModel();
}

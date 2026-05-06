"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle, Clock, XCircle, Shield, User } from "lucide-react";
import { getAdminUsers } from "../_lib/admin-users-actions";
import { UserStatusActions } from "./user-status-actions";
import { auth } from "@/lib/auth";

interface UserData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  total: number;
  stats: Array<{ status: string; count: number }>;
  totalPages: number;
}

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "";
  const role = searchParams.get("role") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminUsers({ status, role, search, page });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, role, search, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilter = (formData: FormData) => {
    const params = new URLSearchParams();
    const newSearch = formData.get("search") as string;
    const newStatus = formData.get("status") as string;
    const newRole = formData.get("role") as string;

    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);
    if (newRole) params.set("role", newRole);

    router.push(`/admin/users?${params.toString()}`);
  };

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (overrides.page === "1") params.delete("page");
    return `/admin/users${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const statsMap: Record<string, number> = {};
  for (const s of data.stats) statsMap[s.status] = s.count;

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const roleOptions = [
    { value: "", label: "Semua Role" },
    { value: "USER", label: "User" },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

  function getStatusBadge(s: string) {
    switch (s) {
      case "VERIFIED":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getRoleBadge(r: string) {
    switch (r) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700";
      case "ADMIN":
        return "bg-blue-100 text-blue-700";
      case "USER":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getRoleIcon(r: string) {
    switch (r) {
      case "SUPER_ADMIN":
        return Shield;
      case "ADMIN":
        return Users;
      default:
        return User;
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Kelola Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.total} pengguna ditemukan
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Pending",
            value: statsMap["PENDING"] ?? 0,
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Verified",
            value: statsMap["VERIFIED"] ?? 0,
            icon: CheckCircle,
            color: "text-emerald-600",
          },
          {
            label: "Rejected",
            value: statsMap["REJECTED"] ?? 0,
            icon: XCircle,
            color: "text-red-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-4 flex items-center gap-3"
          >
            <stat.icon className={`size-5 ${stat.color}`} />
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form action={handleFilter} className="flex flex-wrap items-center gap-3 mb-6">
        <input
          name="search"
          type="text"
          placeholder="Cari nama atau email..."
          defaultValue={search}
          className="flex-1 min-w-48 px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          name="role"
          defaultValue={role}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Filter
        </button>
        {(search || status || role) && (
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Users Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Pengguna
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Bergabung
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                const isCurrentUser = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name}
                            className="size-10 rounded-full object-cover shrink-0 bg-muted"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-muted shrink-0 flex items-center justify-center">
                            <User className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-medium text-foreground hover:underline line-clamp-1"
                            >
                              {user.name}
                            </Link>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        <RoleIcon className="size-3" />
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusActions
                        userId={user.id}
                        status={user.status}
                        role={user.role}
                        isCurrentUser={isCurrentUser}
                        isArchived={!!user.deletedAt}
                      />
                    </td>
                  </tr>
                );
              })}
              {data.users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {data.totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Sebelumnya
              </Link>
            )}
            {page < data.totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminUsersClient() {
  return (
    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
      <UsersContent />
    </Suspense>
  );
}

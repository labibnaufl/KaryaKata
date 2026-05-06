"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Globe, Archive } from "lucide-react";
import { getAdminArticles } from "../../_lib/admin-actions";
import { ArticleStatusActions } from "./article-status-actions";

interface ArticleData {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    category: string;
    status: string;
    views: number;
    readTime: number | null;
    publishedAt: Date | null;
    createdAt: string;
    author: { name: string | null };
    tags: Array<{ tag: { name: string } }>;
  }>;
  total: number;
  stats: Array<{ status: string; _count: number }>;
  totalPages: number;
}

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  initialData: ArticleData;
  availableTags?: Array<{ id: string; name: string }>;
  availableCategories?: Category[];
};

function ArticlesContent({ initialData, availableCategories = [] }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<ArticleData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create a unique key based on URL params to trigger re-fetch
  const cacheKey = `${status}-${category}-${search}-${page}`;

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getAdminArticles({ status, category, search, page });
      setData(result);
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [status, category, search, page]);

  // Refetch when URL params change
  useEffect(() => {
    loadData();
  }, [cacheKey, loadData]);

  const handleFilter = (formData: FormData) => {
    const params = new URLSearchParams();
    const newSearch = formData.get("search") as string;
    const newStatus = formData.get("status") as string;
    const newCategory = formData.get("category") as string;

    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);
    if (newCategory) params.set("category", newCategory);

    router.push(`/admin/articles?${params.toString()}`);
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
    return `/admin/articles${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const statsMap: Record<string, number> = {};
  for (const s of data.stats) statsMap[s.status] = s._count.id;

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  // Use categories from database, fallback to empty
  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    ...(availableCategories?.map((c) => ({ value: c.slug, label: c.name })) ?? []),
  ];

  function getStatusBadge(s: string) {
    switch (s) {
      case "PUBLISHED":
        return "bg-emerald-100 text-emerald-700";
      case "DRAFT":
        return "bg-amber-100 text-amber-700";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getCategoryBadge(c: string) {
    switch (c) {
      case "ENERGI":
        return "bg-orange-100 text-orange-700";
      case "NON_ENERGI":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Kelola Artikel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.total} artikel ditemukan
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Tulis Artikel
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Draft",
            value: statsMap["DRAFT"] ?? 0,
            icon: FileText,
            color: "text-amber-600",
          },
          {
            label: "Published",
            value: statsMap["PUBLISHED"] ?? 0,
            icon: Globe,
            color: "text-emerald-600",
          },
          {
            label: "Archived",
            value: statsMap["ARCHIVED"] ?? 0,
            icon: Archive,
            color: "text-gray-500",
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
          placeholder="Cari judul atau ringkasan..."
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
          name="category"
          defaultValue={category}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {categoryOptions.map((o) => (
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
        {(search || status || category) && (
          <Link
            href="/admin/articles"
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Article Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Artikel
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Penulis
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Views
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Tanggal
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.articles.map((article: any) => (
                <tr
                  key={article.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.coverImage}
                          alt=""
                          className="size-10 rounded-lg object-cover shrink-0 bg-muted"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-medium text-foreground hover:underline line-clamp-1"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                        {article.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {article.tags.slice(0, 3).map((t: any) => (
                              <span
                                key={t.tag.name}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                              >
                                {t.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(
                        article.category
                      )}`}
                    >
                      {article.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        article.status
                      )}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {article.author.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {article.views.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(
                      article.publishedAt ?? article.createdAt
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleStatusActions
                      articleId={article.id}
                      status={article.status}
                    />
                  </td>
                </tr>
              ))}
              {data.articles.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Tidak ada artikel ditemukan.
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

export function AdminArticlesClient({ initialData, availableTags, availableCategories }: Props) {
  return (
    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
      <ArticlesContent initialData={initialData} availableTags={availableTags} availableCategories={availableCategories} />
    </Suspense>
  );
}

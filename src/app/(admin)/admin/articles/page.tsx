import { Suspense } from "react";
import { AdminArticlesClient } from "./_components/admin-articles-client";
import { getAdminArticles, getAvailableTags, getAvailableCategories } from "../_lib/admin-actions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function AdminArticlesFallback() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 rounded-lg border shadow-sm">
        <div className="p-4">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="border-t p-4">
          <div className="h-32 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const category = typeof params.category === "string" ? params.category : "";
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  const [data, tags, categories] = await Promise.all([
    getAdminArticles({ status, category, search, page }),
    getAvailableTags(),
    getAvailableCategories(),
  ]);

  return (
    <Suspense fallback={<AdminArticlesFallback />}>
      <AdminArticlesClient initialData={data} availableTags={tags} availableCategories={categories} />
    </Suspense>
  );
}

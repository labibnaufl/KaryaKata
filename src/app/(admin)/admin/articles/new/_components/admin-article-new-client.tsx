"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableTags, getAvailableCategories } from "../../../_lib/admin-actions";
import { createArticle } from "../../_lib/actions";
import { ArticleForm } from "../../_components/article-form";

interface Tag {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function AdminArticleNewClient() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createArticle, undefined);
  
  // Handle navigation after successful submission
  useEffect(() => {
    if (state?.success) {
      router.push("/admin/articles");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [tagsResult, categoriesResult] = await Promise.all([
          getAvailableTags(),
          getAvailableCategories(),
        ]);
        setTags(tagsResult);
        setCategories(categoriesResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-xl font-bold font-heading">Tulis Artikel Baru</h1>
      </div>

      <ArticleForm 
        action={formAction} 
        state={state}
        isPending={isPending}
        tags={tags} 
        categories={categories} 
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Clock } from "lucide-react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "../../_components/article-form";
import { updateArticle } from "../../_lib/actions";

interface Tag {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  tags: { tagId: string }[];
  publishedAt?: string;
  readTime?: number;
  viewCount?: number;
}

interface EditArticleClientProps {
  article: Article;
  tags: Tag[];
  categories: Category[];
}

export function EditArticleClient({ article, tags, categories }: EditArticleClientProps) {
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateArticle, undefined);
  
  // Stay on edit page after save - just refresh to show updated data
  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Kembali
          </Link>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-xl font-bold font-heading">Edit Artikel</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}
          >
            {article.status}
          </span>
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Globe className="size-3.5" />
              {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          {article.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {article.readTime} menit baca
            </span>
          )}
          <span>{(article.viewCount || 0).toLocaleString("id-ID")} views</span>
        </div>
      </div>

      <ArticleForm
        action={formAction}
        state={state}
        isPending={isPending}
        tags={tags}
        categories={categories}
        article={article}
      />
    </div>
  );
}

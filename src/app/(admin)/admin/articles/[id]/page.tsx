import { notFound } from "next/navigation";
import { EditArticleClient } from "./_components/edit-article-client";
import { getArticleByIdWithDetails } from "@/models/article";
import { getAvailableTags } from "@/models/tag";
import { getAllCategories } from "@/models/category";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, tags, categories] = await Promise.all([
    getArticleByIdWithDetails(id),
    getAvailableTags(),
    getAllCategories(),
  ]);

  if (!article) notFound();

  // Build article data for the form
  const articleData = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || "",
    content: article.body || "",
    category: article.categoryId || "",
    status: article.status,
    coverImage: article.coverImage || null,
    metaTitle: article.metaTitle || null,
    metaDescription: article.metaDescription || null,
    keywords: article.keywords ? article.keywords.split(",").map(k => k.trim()).filter(Boolean) : [],
    tags: article.tags.map((t) => ({ tagId: t.id })),
    publishedAt: article.publishedAt?.toISOString(),
    readTime: article.readTime || undefined,
    viewCount: article.viewCount || 0,
  };

  return (
    <EditArticleClient
      article={articleData}
      tags={tags}
      categories={categories}
    />
  );
}

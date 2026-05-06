import Link from "next/link";
import type { ArticleWithAuthor } from "@/types";

interface FeaturedArticleProps {
  article: ArticleWithAuthor;
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group grid md:grid-cols-2 gap-8 items-center bg-white rounded-sm overflow-hidden border border-black/10 hover:border-black/30 transition-colors"
    >
      {/* Image - Using img tag for debugging */}
      <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-[300px] overflow-hidden bg-gray-100">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-6xl font-heading text-gray-300">K</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 md:p-12">
        {/* Category */}
        {article.categoryName && (
          <div
            className="inline-block px-3 py-1 text-xs font-sans uppercase tracking-wider text-white rounded-sm mb-6"
            style={{ backgroundColor: article.categoryColor || "#000" }}
          >
            {article.categoryName}
          </div>
        )}

        <h2 className="font-heading text-3xl md:text-4xl font-normal leading-tight mb-4 group-hover:opacity-70 transition-opacity">
          {article.title}
        </h2>

        <p className="font-sans text-base text-black/70 mb-6 line-clamp-3">
          {article.excerpt || "Tidak ada ringkasan."}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-black/50 font-sans">
          <div className="flex items-center gap-2">
            {article.authorImage ? (
              <img
                src={article.authorImage}
                alt={article.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold">
                {article.authorName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{article.authorName}</span>
          </div>

          <span>•</span>

          {formattedDate && <span>{formattedDate}</span>}

          <span>•</span>

          <span>{article.viewCount || 0} pembaca</span>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <span className="inline-flex items-center text-sm font-sans uppercase tracking-wider text-black border-b border-black pb-1 group-hover:opacity-60 transition-opacity">
            Baca Artikel <span className="ml-2">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

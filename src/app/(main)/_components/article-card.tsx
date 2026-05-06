import Link from "next/link";
import Image from "next/image";
import type { ArticleWithAuthor } from "@/types";

interface ArticleCardProps {
  article: ArticleWithAuthor;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const readTime = article.readTime || Math.ceil((article.excerpt?.length || 0) / 500);
  
  // Format date
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
      className="group block bg-white rounded-sm overflow-hidden border border-black/10 hover:border-black/30 transition-colors"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl font-heading text-gray-300">K</span>
          </div>
        )}
        
        {/* Category Badge */}
        {article.categoryName && (
          <div
            className="absolute top-4 left-4 px-3 py-1 text-xs font-sans uppercase tracking-wider text-white rounded-sm"
            style={{ backgroundColor: article.categoryColor || "#000" }}
          >
            {article.categoryName}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl md:text-2xl font-normal leading-tight mb-3 group-hover:opacity-70 transition-opacity">
          {article.title}
        </h3>

        <p className="font-sans text-sm text-black/60 line-clamp-2 mb-4">
          {article.excerpt || "Tidak ada ringkasan."}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-black/50 font-sans">
          {/* Author */}
          <div className="flex items-center gap-2">
            {article.authorImage ? (
              <img
                src={article.authorImage}
                alt={article.authorName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">
                {article.authorName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{article.authorName}</span>
          </div>

          <span>•</span>

          {/* Date */}
          {formattedDate && <span>{formattedDate}</span>}

          <span>•</span>

          {/* Read Time */}
          <span>{readTime} menit baca</span>
        </div>
      </div>
    </Link>
  );
}

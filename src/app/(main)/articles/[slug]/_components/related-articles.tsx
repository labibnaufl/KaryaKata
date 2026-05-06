"use client";

import Link from "next/link";
import Image from "next/image";
import type { ArticleWithAuthor } from "@/types";

interface RelatedArticlesProps {
  articles: ArticleWithAuthor[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8">
      <h3 className="font-heading text-lg font-medium mb-6">
        Artikel Terkait
      </h3>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group flex gap-4 items-start"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-lg font-heading text-gray-300">K</span>
                </div>
              )}
            </div>
            
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h4 className="font-sans text-sm font-medium text-black leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                {article.title}
              </h4>
              {article.categoryName && (
                <span className="text-xs text-black/50 mt-1 block">
                  {article.categoryName}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use server";

import { getPublishedArticles } from "@/models/article";
import Link from "next/link";
import Image from "next/image";

export async function LatestArticlesSection() {
  // Fetch only 3 latest articles
  const articles = await getPublishedArticles(1, 3);

  if (articles.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-[#F8F4ED]">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-normal text-black">
              Artikel Terbaru
            </h2>
            <Link
              href="/articles"
              className="text-sm font-sans uppercase tracking-wider text-black/60 hover:text-black transition-colors"
            >
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="text-center py-16">
            <p className="font-sans text-black/60">
              Belum ada artikel yang dipublikasikan.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[#F8F4ED]">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-normal text-black">
            Artikel Terbaru
          </h2>
          <Link
            href="/articles"
            className="text-sm font-sans uppercase tracking-wider text-black/60 hover:text-black transition-colors"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {/* Articles Grid - 3 columns, just image and title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-4xl font-heading text-gray-300">K</span>
                  </div>
                )}
              </div>
              
              {/* Title Only */}
              <h3 className="font-heading text-lg md:text-xl font-normal leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                {article.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

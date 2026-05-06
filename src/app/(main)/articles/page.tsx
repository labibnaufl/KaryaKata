import { Suspense } from "react";
import Link from "next/link";
import { getPublishedArticles, getPublishedArticlesCount } from "@/models/article";
import { getAllCategories } from "@/models/category";
import { ArticleCard } from "../_components/article-card";
import { ArticleFilters } from "../_components/article-filters";

export const revalidate = 3600; // ISR: revalidate every hour

interface ArticlesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    category?: string; 
    search?: string 
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const categorySlug = params.category;
  const searchQuery = params.search;

  // Fetch data in parallel
  const [articles, totalCount, categories] = await Promise.all([
    getPublishedArticles(currentPage, 9, categorySlug, searchQuery),
    getPublishedArticlesCount(categorySlug, searchQuery),
    getAllCategories(),
  ]);

  const totalPages = Math.ceil(totalCount / 9);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-4">
              Semua Artikel
            </h1>
            <p className="font-sans text-lg text-white/70 max-w-2xl">
              Jelajahi koleksi artikel dari para penulis kami. Temukan cerita, 
              wawasan, dan inspirasi dalam setiap tulisan.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-12">
        {/* Filters */}
        <Suspense fallback={<div className="h-16 bg-gray-50 rounded animate-pulse mb-8" />}>
          <ArticleFilters categories={categories} />
        </Suspense>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6">
            <p className="font-sans text-black/60">
              Hasil pencarian untuk <span className="font-medium text-black">"{searchQuery}"</span> 
              ({totalCount} artikel)
            </p>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20">
            <h3 className="font-heading text-xl mb-2">Tidak ada artikel</h3>
            <p className="font-sans text-black/60">
              {searchQuery 
                ? "Tidak ditemukan artikel yang cocok dengan pencarian Anda." 
                : "Belum ada artikel yang dipublikasikan."}
            </p>
            {searchQuery && (
              <Link
                href="/articles"
                className="inline-block mt-4 text-black underline font-sans"
              >
                Lihat semua artikel
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {currentPage > 1 && (
              <Link
                href={`/articles?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="px-4 py-2 border border-black/20 text-black/60 hover:border-black hover:text-black transition-colors font-sans text-sm"
              >
                &larr; Sebelumnya
              </Link>
            )}
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/articles?page=${page}${categorySlug ? `&category=${categorySlug}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className={`w-10 h-10 flex items-center justify-center font-sans text-sm transition-colors ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "border border-black/20 text-black/60 hover:border-black hover:text-black"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
            
            {currentPage < totalPages && (
              <Link
                href={`/articles?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="px-4 py-2 border border-black/20 text-black/60 hover:border-black hover:text-black transition-colors font-sans text-sm"
              >
                Selanjutnya &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

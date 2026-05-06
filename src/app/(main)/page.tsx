import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getFeaturedArticle, getPublishedArticles } from "@/models/article";
import { getAllCategories } from "@/models/category";
import { ArticleCard } from "./_components/article-card";
import { FeaturedArticle } from "./_components/featured-article";
import { ArticleFilters } from "./_components/article-filters";
import { HeroSection } from "./_components/hero-section";
import { HeroHeadline } from "./_components/hook-section";
import { FeaturedSection } from "./_components/categori-section";
import { LatestArticlesSection } from "./_components/latest-articles-section";
import { CTAheadline } from "./_components/CTA-headline";
import { CTASection } from "./_components/CTA-section";

// Revalidate every hour (ISR)
export const revalidate = 3600;

export default async function HomePage() {
  // Fetch data in parallel
  const [featured, latestArticles, categories] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(1, 6), // First 6 articles
    getAllCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      {/* Hero Section */}
      <HeroSection articles={latestArticles.slice(0, 4)} />
      <HeroHeadline />
      <FeaturedSection />
      <LatestArticlesSection />
      <CTAheadline/>
      <CTASection/>
    </div>
  );
}

"use server";

import { getFeaturedArticle, getPublishedArticles } from "@/models/article";
import { getAllCategories } from "@/models/category";

export async function getHomepageData() {
  const [featured, latestArticles, categories] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(1, 6),
    getAllCategories(),
  ]);

  return {
    featured,
    latestArticles,
    categories,
  };
}

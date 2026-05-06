"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CategoryWithCount } from "@/types";

interface ArticleFiltersProps {
  categories: CategoryWithCount[];
}

export function ArticleFilters({ categories }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  const activeCategory = searchParams.get("category");

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/articles?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to page 1 on search
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-4 py-2 text-sm font-sans transition-colors rounded-sm ${
            !activeCategory
              ? "bg-black text-white"
              : "bg-black/5 text-black hover:bg-black/10"
          }`}
        >
          Semua
        </button>
        
        {categories.slice(0, 5).map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={`px-4 py-2 text-sm font-sans transition-colors rounded-sm ${
              activeCategory === category.slug
                ? "bg-black text-white"
                : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-black/20 rounded-sm text-sm font-sans focus:outline-none focus:border-black transition-colors w-48 md:w-64"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white text-sm font-sans rounded-sm hover:bg-black/80 transition-colors"
        >
          Cari
        </button>
      </form>
    </div>
  );
}

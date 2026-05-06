import type { ArticleFull } from "@/types";

interface ArticleMetaProps {
  authorName: string;
  authorImage: string | null;
  publishedAt: Date | null;
  readTime: number | null;
  viewCount: number;
}

export function ArticleMeta({ 
  authorName, 
  authorImage, 
  publishedAt, 
  readTime, 
  viewCount 
}: ArticleMetaProps) {
  const formattedDate = publishedAt 
    ? new Date(publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-sans">
      {/* Author */}
      <div className="flex items-center gap-2">
        {authorImage ? (
          <img
            src={authorImage}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-medium">{authorName}</span>
      </div>

      <span className="text-white/40">•</span>

      {/* Date */}
      {formattedDate && <span>{formattedDate}</span>}

      <span className="text-white/40">•</span>

      {/* Read Time */}
      <span>{readTime || 5} menit baca</span>

      <span className="text-white/40">•</span>

      {/* View Count */}
      <span>{viewCount.toLocaleString("id-ID")} dilihat</span>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBookmarks } from "@/models/bookmark";
import { ArticleCard } from "../_components/article-card";

export const metadata = {
  title: "Bookmark - Karya Kata.",
};

export default async function BookmarksPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const bookmarks = await getUserBookmarks(session.user.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container mx-auto px-8">
          <h1 className="font-heading text-3xl md:text-5xl font-normal">
            Bookmark Anda
          </h1>
          <p className="font-sans text-white/70 mt-4 max-w-xl">
            Artikel yang telah Anda simpan untuk dibaca nanti.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-8 py-12">
        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((bookmark) => (
              <ArticleCard key={bookmark.id} article={bookmark.article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-heading text-xl mb-2">Belum ada bookmark</h2>
            <p className="font-sans text-black/60">
              Simpan artikel yang ingin Anda baca nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

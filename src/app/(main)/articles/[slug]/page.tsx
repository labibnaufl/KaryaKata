import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, incrementViewCount, getRelatedArticles } from "@/models/article";
import { getCommentsByArticleId } from "@/models/comment";
import { getReactionCounts } from "@/models/reaction";
import { auth } from "@/lib/auth";
import { ArticleContent } from "./_components/article-content";
import { ArticleMeta } from "./_components/article-meta";
import { ReactionBar } from "./_components/reaction-bar";
import { BookmarkButton } from "./_components/bookmark-button";
import { CommentSection } from "./_components/comment-section";
import { RelatedArticles } from "./_components/related-articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan | Karya Kata",
    };
  }
  
  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }
  
  // Increment view count
  await incrementViewCount(article.id);
  
  // Fetch related data in parallel
  const [comments, reactions, relatedArticles, session] = await Promise.all([
    getCommentsByArticleId(article.id),
    getReactionCounts(article.id),
    getRelatedArticles(article.category_id, article.id, 3),
    auth(),
  ]);
  
  const isAuthenticated = !!session?.user;
  
  return (
    <main className="min-h-screen bg-[#F8F4ED]">
      {/* Article Header */}
      <header className="relative">
        {/* Cover Image */}
        {article.cover_image ? (
          <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : null}
        
        {/* Title Overlay */}
        <div className={`${article.cover_image ? 'absolute bottom-0 left-0 right-0' : 'pt-20 pb-10 bg-[#F8F4ED]'} px-6 md:px-12 lg:px-20`}>
          <div className="max-w-4xl mx-auto">
            {/* Category */}
            {article.category_name && (
              <span 
                className="inline-block px-3 py-1 text-xs font-sans uppercase tracking-wider text-white rounded-sm mb-4"
                style={{ backgroundColor: article.category_color || '#0e0e0e' }}
              >
                {article.category_name}
              </span>
            )}
            
            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-normal text-white leading-tight mb-6">
              {article.title}
            </h1>
            
            {/* Meta Info */}
            <ArticleMeta 
              authorName={article.author_name}
              authorImage={article.author_image}
              publishedAt={article.published_at}
              readTime={article.read_time}
              viewCount={article.view_count}
            />
          </div>
        </div>
      </header>
      
      {/* Article Content */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
            {/* Main Content */}
            <article>
              {/* Excerpt */}
              {article.excerpt && (
                <p className="font-sans text-lg text-black/70 leading-relaxed mb-8 border-l-4 border-black/20 pl-6">
                  {article.excerpt}
                </p>
              )}
              
              {/* Body Content */}
              <ArticleContent content={article.body} />
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-black/10">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: { id: string; name: string; slug: string }) => (
                      <span 
                        key={tag.id}
                        className="px-3 py-1 text-sm font-sans text-black/60 bg-black/5 rounded-full"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Engagement Bar */}
              <div className="mt-8 pt-8 border-t border-black/10 flex items-center justify-between">
                <ReactionBar 
                  articleId={article.id} 
                  initialReactions={{ likes: reactions.likes || 0, dislikes: reactions.dislikes || 0 }}
                  isAuthenticated={isAuthenticated}
                />
                <BookmarkButton 
                  articleId={article.id}
                  isAuthenticated={isAuthenticated}
                />
              </div>
              
              {/* Comments Section */}
              <div className="mt-12">
                <CommentSection 
                  articleId={article.id}
                  comments={comments}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </article>
            
            {/* Sidebar - Related Articles */}
            <aside className="hidden lg:block">
              <RelatedArticles articles={relatedArticles} />
            </aside>
          </div>
        </div>
      </div>
      
      {/* Mobile Related Articles */}
      <div className="lg:hidden px-6 md:px-12 lg:px-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <RelatedArticles articles={relatedArticles} />
        </div>
      </div>
    </main>
  );
}

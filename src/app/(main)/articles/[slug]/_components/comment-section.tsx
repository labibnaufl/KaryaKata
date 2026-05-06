import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import type { CommentWithAuthor } from "@/types";

interface CommentSectionProps {
  articleId: string;
  comments: CommentWithAuthor[];
  isAuthenticated: boolean;
}

export function CommentSection({ 
  articleId, 
  comments, 
  isAuthenticated 
}: CommentSectionProps) {
  return (
    <div className="border-t border-black/10 pt-12">
      <h2 className="font-heading text-2xl font-normal mb-8">
        Komentar ({comments.length})
      </h2>

      {/* Comment Form */}
      <CommentForm 
        articleId={articleId} 
        isAuthenticated={isAuthenticated} 
      />

      {/* Comments List */}
      <CommentList 
        comments={comments} 
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}

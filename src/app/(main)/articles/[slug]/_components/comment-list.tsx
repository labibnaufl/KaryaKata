"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { softDeleteCommentAction } from "../_lib/actions";
import type { CommentWithAuthor } from "@/types";

interface CommentListProps {
  comments: CommentWithAuthor[];
  isAuthenticated: boolean;
}

export function CommentList({ comments, isAuthenticated }: CommentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      await softDeleteCommentAction(commentId);
      toast.success("Komentar berhasil dihapus");
      // Refresh would happen from parent re-fetch
    } catch (error) {
      toast.error("Gagal menghapus komentar");
    } finally {
      setDeletingId(null);
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-black/5 rounded-lg">
        <p className="font-sans text-black/50">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
            className="bg-white rounded-lg p-6 border border-black/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {comment.authorImage ? (
                  <img
                    src={comment.authorImage}
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold"
                  >
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-medium text-black">
                      {comment.authorName}
                    </span>
                    <span className="text-black/30">•</span>
                    <span className="font-sans text-sm text-black/50">
                      {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="font-sans text-black/80 mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Delete button - only show for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-black/30 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Hapus komentar"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

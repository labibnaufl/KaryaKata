"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { toggleReactionAction, getReactionCountsAction } from "../_lib/actions";

interface ReactionBarProps {
  articleId: string;
  initialReactions: { likes: number; dislikes: number };
  isAuthenticated: boolean;
}

export function ReactionBar({ 
  articleId, 
  initialReactions, 
  isAuthenticated 
}: ReactionBarProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [isLoading, setIsLoading] = useState(false);

  const likeCount = reactions.likes || 0;
  const dislikeCount = reactions.dislikes || 0;

  async function handleReaction(type: "LIKE" | "DISLIKE") {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk memberikan reaksi");
      return;
    }

    setIsLoading(true);
    try {
      await toggleReactionAction(articleId, type);
      // Refresh reaction counts
      const updatedReactions = await getReactionCountsAction(articleId);
      setReactions(updatedReactions);
      toast.success("Reaksi berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan reaksi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Like Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleReaction("LIKE")}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors disabled:opacity-50"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
        <span className="font-sans text-sm font-medium">{likeCount}</span>
      </motion.button>

      {/* Dislike Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleReaction("DISLIKE")}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors disabled:opacity-50"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
        <span className="font-sans text-sm font-medium">{dislikeCount}</span>
      </motion.button>
    </div>
  );
}

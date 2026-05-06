"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleBookmarkAction, isBookmarkedAction } from "../_lib/actions";

interface BookmarkButtonProps {
  articleId: string;
  isAuthenticated: boolean;
}

export function BookmarkButton({ articleId, isAuthenticated }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial bookmark state
  useState(() => {
    if (isAuthenticated) {
      isBookmarkedAction(articleId).then(setBookmarked);
    }
  });

  async function handleToggle() {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyimpan artikel");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleBookmarkAction(articleId);
      setBookmarked(result.isBookmarked);
      toast.success(result.isBookmarked ? "Artikel disimpan" : "Artikel dihapus dari simpanan");
    } catch (error) {
      toast.error("Gagal menyimpan artikel");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors disabled:opacity-50 ${
        bookmarked 
          ? "bg-black text-white" 
          : "bg-black/5 hover:bg-black/10 text-black"
      }`}
    >
      <Bookmark 
        className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} 
      />
      <span className="font-sans text-sm font-medium">
        {bookmarked ? "Tersimpan" : "Simpan"}
      </span>
    </motion.button>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCommentAction } from "../_lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  articleId: string;
  isAuthenticated: boolean;
}

export function CommentForm({ articleId, isAuthenticated }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Silakan login untuk berkomentar");
      return;
    }

    if (!content.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommentAction(articleId, content);
      setContent("");
      toast.success("Komentar berhasil ditambahkan");
      // Page will revalidate and show new comment
      window.location.reload();
    } catch (error) {
      toast.error("Gagal menambahkan komentar");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-black/5 rounded-lg p-6 mb-8 text-center">
        <p className="font-sans text-black/70">
          Silakan <a href="/login" className="text-black underline">login</a> untuk berkomentar
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <Textarea
        placeholder="Tulis komentar Anda..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] mb-4 bg-white border-black/10 focus:border-black"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !content.trim()}
          className="bg-black text-white hover:bg-black/80"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
        </Button>
      </div>
    </form>
  );
}

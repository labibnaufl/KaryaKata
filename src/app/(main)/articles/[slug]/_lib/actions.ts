"use server";

import { auth } from "@/lib/auth";
import { toggleReaction as toggleReactionModel, getReactionCounts } from "@/models/reaction";
import { toggleBookmark as toggleBookmarkModel, isBookmarked as isBookmarkedModel } from "@/models/bookmark";
import { createComment as createCommentModel, softDeleteComment as softDeleteCommentModel } from "@/models/comment";
import { revalidatePath } from "next/cache";

// ============================================================
// REACTION ACTIONS
// ============================================================

export async function toggleReactionAction(articleId: string, type: "LIKE" | "DISLIKE") {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  await toggleReactionModel(articleId, session.user.id, type);
  revalidatePath(`/articles/[slug]`);
  return getReactionCounts(articleId);
}

export async function getReactionCountsAction(articleId: string) {
  return getReactionCounts(articleId);
}

// ============================================================
// BOOKMARK ACTIONS
// ============================================================

export async function toggleBookmarkAction(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const result = await toggleBookmarkModel(articleId, session.user.id);
  revalidatePath(`/articles/[slug]`);
  return result;
}

export async function isBookmarkedAction(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }
  
  return isBookmarkedModel(articleId, session.user.id);
}

// ============================================================
// COMMENT ACTIONS
// ============================================================

export async function createCommentAction(articleId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  if (!content.trim()) {
    throw new Error("Content is required");
  }
  
  const result = await createCommentModel({
    articleId,
    content: content.trim(),
    userId: session.user.id,
  });
  
  revalidatePath(`/articles/[slug]`);
  return result;
}

export async function softDeleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  // TODO: Check if user owns the comment or is admin
  await softDeleteCommentModel(commentId);
  revalidatePath(`/articles/[slug]`);
}

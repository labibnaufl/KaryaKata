"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { articleSchema } from "./validations";
import {
  createArticle as createArticleModel,
  updateArticle as updateArticleModel,
  softDeleteArticle,
  updateArticleStatus,
  getArticleById,
  checkSlugExists,
} from "@/models/article";
import { syncArticleTags, getOrCreateTagByName } from "@/models/tag";
import { getOrCreateCategoryByName } from "@/models/category";
import { createLog } from "@/models/admin-log";

// ==================
// Auth Guard
// ==================
async function requireAdminAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ==================
// Helpers
// ==================
function calculateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title);
  // Use timestamp suffix for better uniqueness (avoids race conditions)
  const timestamp = Date.now().toString(36).slice(-4);
  let slug = `${base}-${timestamp}`;
  let counter = 1;

  while (true) {
    const exists = await checkSlugExists(slug, excludeId);
    if (!exists) break;
    slug = `${base}-${timestamp}-${counter++}`;
    // Safety limit to prevent infinite loop
    if (counter > 100) {
      throw new Error("Could not generate unique slug after 100 attempts");
    }
  }
  return slug;
}

// ==================
// Admin Log Helper
// ==================
async function createAdminLog(data: {
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}) {
  try {
    await createLog(
      data.adminId,
      `${data.entity}_${data.action}`,
      data.entity,
      data.entityId,
      data.details,
    );
  } catch (error) {
    console.error("[Admin Log Error]", error);
  }
}

// ==================
// CREATE
// ==================
export async function createArticle(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  // Skip if formData is not a FormData or is empty (happens when useActionState re-calls action)
  // Return previous state to preserve success/error messages
  if (!(formData instanceof FormData)) {
    return prevState;
  }
  if ([...formData.entries()].length === 0) {
    return prevState;
  }
  
  // Debug: log form data
  console.log("[createArticle] formData received:", formData instanceof FormData);
  console.log("[createArticle] formData entries:", [...formData.entries()]);
  
  const session = await requireAdminAction();

  const coverImage = (formData.get("coverImage") as string) || undefined;

  const raw = {
    title: formData.get("title") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    coverImage,
    tagIds: formData.getAll("tagIds") as string[],
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    title,
    excerpt,
    content,
    category,
    tagIds,
    metaTitle,
    metaDescription,
    keywords,
  } = parsed.data;

  const slug = await generateUniqueSlug(title);
  const readTime = calculateReadTime(content);
  const keywordsArray = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const shouldPublish = formData.get("submitAction") === "publish";

  try {
    const article = await createArticleModel({
      title,
      slug,
      excerpt,
      body: content,
      status: shouldPublish ? "PUBLISHED" : "DRAFT",
      coverImage,
      authorId: session.user.id,
      categoryId: category || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray.join(",") : undefined,
    });

    // Sync tags
    if (tagIds.length > 0) {
      await syncArticleTags(article.id, tagIds);
    }

    await createAdminLog({
      adminId: session.user.id,
      action: shouldPublish ? "PUBLISH" : "CREATE",
      entity: "Article",
      entityId: article.id,
      details: `${shouldPublish ? "Published" : "Created draft"}: "${title}"`,
    });

    revalidatePath("/admin/articles");
    redirect("/admin/articles");
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - they should propagate
    if (typeof error === 'object' && error !== null && 'digest' in error && 
        typeof (error as { digest?: string }).digest === 'string' && 
        (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // Handle duplicate slug error
    if (typeof error === 'object' && error !== null && 'code' in error && 
        (error as { code?: string }).code === '23505' && 
        typeof (error as { detail?: string }).detail === 'string' &&
        (error as { detail: string }).detail.includes('slug')) {
      console.error("Create article error: Duplicate slug detected", error);
      return { error: "Judul artikel sudah ada, silakan gunakan judul yang berbeda atau tunggu sebentar" };
    }
    console.error("Create article error:", error);
    return { error: "Failed to create article" };
  }
}

// ==================
// UPDATE
// ==================
export async function updateArticle(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  // If we already have a success state, preserve it (don't let empty formData overwrite it)
  if (prevState?.success) {
    return prevState;
  }
  
  // Handle React useActionState re-calls with empty/non-FormData
  if (!(formData instanceof FormData) || [...formData.entries()].length === 0) {
    return prevState;
  }

  // Debug: log form data
  console.log("[updateArticle] formData received:", formData instanceof FormData);
  console.log("[updateArticle] formData entries:", [...formData.entries()]);

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "ID artikel tidak ditemukan" };
  }

  const session = await requireAdminAction();

  const existingArticle = await getArticleById(id);
  if (!existingArticle) return { error: "Artikel tidak ditemukan." };

  const coverImageValue = (formData.get("coverImage") as string) || undefined;
  const coverImage: string | undefined =
    coverImageValue || existingArticle.coverImage || undefined;

  const raw = {
    title: formData.get("title") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    coverImage,
    tagIds: formData.getAll("tagIds") as string[],
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    title,
    excerpt,
    content,
    category,
    tagIds,
    metaTitle,
    metaDescription,
    keywords,
  } = parsed.data;

  const slug = await generateUniqueSlug(title, id);
  const readTime = calculateReadTime(content);
  const keywordsArray = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const shouldPublish = formData.get("submitAction") === "publish";
  const wasPublished = existingArticle.status === "PUBLISHED";

  try {
    console.log("[updateArticle] Starting update for article:", id);
    // Update article
    await updateArticleModel(id, {
      title,
      slug,
      excerpt,
      body: content,
      categoryId: category || undefined,
      coverImage,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray.join(",") : undefined,
      readTime: readTime,
    });
    console.log("[updateArticle] Article updated successfully");

    // Update status if publishing
    if (shouldPublish && !wasPublished) {
      await updateArticleStatus(id, "PUBLISHED");
      console.log("[updateArticle] Status updated to PUBLISHED");
    }

    // Sync tags
    await syncArticleTags(id, tagIds);
    console.log("[updateArticle] Tags synced");

    await createAdminLog({
      adminId: session.user.id,
      action: "UPDATE",
      entity: "Article",
      entityId: id,
      details: `Updated article: "${title}"`,
    });
    console.log("[updateArticle] Admin log created");

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    console.log("[updateArticle] Paths revalidated, returning success");
    return { success: true };
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - they should propagate
    if (typeof error === 'object' && error !== null && 'digest' in error && 
        typeof (error as { digest?: string }).digest === 'string' && 
        (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Update article error:", error);
    return { error: "Failed to update article" };
  }
}

// ==================
// PUBLISH
// ==================
export async function publishArticle(id: string) {
  const session = await requireAdminAction();

  const article = await getArticleById(id);
  if (!article) throw new Error("Article not found");

  await updateArticleStatus(id, "PUBLISHED");

  await createAdminLog({
    adminId: session.user.id,
    action: "PUBLISH",
    entity: "Article",
    entityId: id,
    details: `Published article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

// ==================
// ARCHIVE
// ==================
export async function archiveArticle(id: string) {
  const session = await requireAdminAction();

  const article = await getArticleById(id);
  if (!article) throw new Error("Article not found");

  await updateArticleStatus(id, "ARCHIVED");

  await createAdminLog({
    adminId: session.user.id,
    action: "ARCHIVE",
    entity: "Article",
    entityId: id,
    details: `Archived article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

export async function revertToDraft(id: string) {
  const session = await requireAdminAction();

  const article = await getArticleById(id);
  if (!article) throw new Error("Article not found");

  await updateArticleStatus(id, "DRAFT");

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "Article",
    entityId: id,
    details: `Reverted to draft: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

// ==================
// DELETE
// ==================
export async function deleteArticle(id: string) {
  const session = await requireAdminAction();

  const article = await getArticleById(id);
  if (!article) return;

  if (article.status === "PUBLISHED") {
    throw new Error(
      "Artikel yang sudah dipublikasikan tidak dapat dihapus. Arsipkan terlebih dahulu.",
    );
  }

  await softDeleteArticle(id);

  await createAdminLog({
    adminId: session.user.id,
    action: "DELETE",
    entity: "Article",
    entityId: id,
    details: `Deleted article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
}

// ==================
// Inline Creation Actions
// ==================

export async function createCategoryAction(name: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  if (!name || name.trim().length < 2) {
    throw new Error("Nama kategori minimal 2 karakter");
  }

  const catSlug = slugify(name);
  const cat = await getOrCreateCategoryByName(name.trim(), catSlug);
  return { id: cat.id, name: name.trim(), slug: catSlug };
}

export async function createTagAction(name: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  if (!name || name.trim().length < 2) {
    throw new Error("Nama tag minimal 2 karakter");
  }

  const tagSlug = slugify(name);
  const tag = await getOrCreateTagByName(name.trim(), tagSlug);
  return { id: tag.id, name: name.trim(), slug: tagSlug };
}

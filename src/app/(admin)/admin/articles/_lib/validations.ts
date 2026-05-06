import { z } from "zod";

export const articleSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  excerpt: z
    .string()
    .min(20, "Ringkasan minimal 20 karakter")
    .max(500, "Ringkasan maksimal 500 karakter"),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  category: z.string().min(1, "Kategori tidak boleh kosong"),
  coverImage: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  tagIds: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  keywords: z.string().optional().or(z.literal("")),
});

export type ArticleInput = z.infer<typeof articleSchema>;

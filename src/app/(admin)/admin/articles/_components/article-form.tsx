"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Plus,
  X,
} from "lucide-react";
import { createCategoryAction, createTagAction } from "../_lib/actions";

type Tag = { id: string; name: string };
type Category = { id: string; name: string; slug: string };

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  tags: { tagId: string }[];
};

type Props = {
  action: (formData: FormData) => void;
  state?: { error?: string; success?: boolean } | undefined;
  isPending?: boolean;
  tags: Tag[];
  categories: Category[];
  article?: Article;
};

// ==================
// Toolbar button
// ==================
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-accent transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

// ==================
// TipTap Toolbar
// ==================
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Masukkan URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Masukkan URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        active={false}
        title="Horizontal Rule"
      >
        <Minus className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={addLink}
        active={editor.isActive("link")}
        title="Add Link"
      >
        <LinkIcon className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} active={false} title="Add Image URL">
        <ImageIcon className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
        title="Undo"
      >
        <Undo className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
        title="Redo"
      >
        <Redo className="size-4" />
      </ToolbarBtn>
    </div>
  );
}

// ==================
// Main Form
// ==================
export function ArticleForm({
  action,
  state,
  isPending = false,
  tags: initialTags,
  categories: initialCategories,
  article,
}: Props) {
  const router = useRouter();

  // Local state for dynamically added tags/categories
  const [localTags, setLocalTags] = useState<Tag[]>(initialTags);
  const [localCategories, setLocalCategories] =
    useState<Category[]>(initialCategories);

  // Inline creation states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  // Track selection for dynamically added items
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    article?.category ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((t) => t.tagId) ?? [],
  );

  // Content HTML state for TipTap editor
  const [contentHtml, setContentHtml] = useState(article?.content ?? "");

  // Cover image states
  const [coverPreview, setCoverPreview] = useState<string | null>(
    article?.coverImage || null,
  );
  const [coverUrl, setCoverUrl] = useState<string>(article?.coverImage || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle navigation after successful submission (only for new articles that manage their own state)
  useEffect(() => {
    if (state?.success && !article) {
      router.push("/admin/articles");
      router.refresh();
    }
  }, [state, router, article]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Mulai menulis artikel..." }),
    ],
    content: article?.content ?? "",
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] p-4 outline-none focus:outline-none",
      },
    },
  });

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const result = await createCategoryAction(newCategoryName.trim());
      setLocalCategories([...localCategories, result]);
      setSelectedCategoryId(result.id);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch {
      // Error is handled by action
    } finally {
      setSavingCategory(false);
    }
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setSavingTag(true);
    try {
      const result = await createTagAction(newTagName.trim());
      setLocalTags([...localTags, result]);
      setSelectedTagIds([...selectedTagIds, result.id]);
      setNewTagName("");
      setIsAddingTag(false);
    } catch {
      // Error is handled by action
    } finally {
      setSavingTag(false);
    }
  };

  return (
    <form action={action} className="space-y-6">
      {/* Hidden ID field for edit mode */}
      {article?.id && <input type="hidden" name="id" value={article.id} />}

      {/* Hidden content field synced from TipTap */}
      <input type="hidden" name="content" value={contentHtml} />

      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Main Column ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Masukkan judul artikel..."
              defaultValue={article?.title}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Ringkasan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              placeholder="Ringkasan singkat artikel (tampil di daftar)..."
              defaultValue={article?.excerpt}
              required
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Konten <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-lg bg-background overflow-hidden min-h-[360px]">
              {editor && (
                <>
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---- Sidebar Column ---- */}
        <div className="space-y-5">
          {/* Category */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Kategori <span className="text-red-500">*</span>
              </label>
              {!isAddingCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="size-3" /> Tambah Baru
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <div className="flex items-center gap-2 mb-3 bg-muted/50 p-2 rounded-lg border">
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded bg-background outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded whitespace-nowrap disabled:opacity-50"
                >
                  {savingCategory ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="p-1 text-muted-foreground hover:bg-muted rounded"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            <select
              name="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {localCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image — uploads directly to /api/upload, stores URL only */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-2">
              Gambar Cover
            </label>
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-36 object-cover rounded-lg mb-3 bg-muted"
              />
            )}
            {/* Only send the URL to the Server Action — no raw file bytes */}
            <input type="hidden" name="coverImage" value={coverUrl} />
            <div className="flex gap-2 flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Immediate local preview
                  setCoverPreview(URL.createObjectURL(file));
                  setUploadError(null);
                  setIsUploading(true);

                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "patra/articles");
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd,
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setCoverUrl(data.url);
                  } catch (err) {
                    setUploadError(
                      err instanceof Error ? err.message : "Upload gagal.",
                    );
                    setCoverPreview("");
                    setCoverUrl("");
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Mengunggah...
                  </>
                ) : coverPreview ? (
                  "Ganti Gambar"
                ) : (
                  "Upload Gambar"
                )}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
              {coverPreview && !isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview("");
                    setCoverUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Hapus Gambar
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Tags</label>
              {!isAddingTag && (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="size-3" /> Tambah Baru
                </button>
              )}
            </div>

            {isAddingTag ? (
              <div className="flex items-center gap-2 mb-3 bg-muted/50 p-2 rounded-lg border">
                <input
                  type="text"
                  placeholder="Nama tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded bg-background outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={savingTag || !newTagName.trim()}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded whitespace-nowrap disabled:opacity-50"
                >
                  {savingTag ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-muted-foreground hover:bg-muted rounded"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            {localTags.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {localTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTagIds([...selectedTagIds, tag.id]);
                        } else {
                          setSelectedTagIds(
                            selectedTagIds.filter((id) => id !== tag.id),
                          );
                        }
                      }}
                      className="rounded"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-3">SEO (Opsional)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Meta Title (maks. 60 karakter)
                </label>
                <input
                  name="metaTitle"
                  defaultValue={article?.metaTitle ?? ""}
                  maxLength={60}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Meta Description (maks. 160 karakter)
                </label>
                <textarea
                  name="metaDescription"
                  defaultValue={article?.metaDescription ?? ""}
                  maxLength={160}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Keywords (pisahkan dengan koma)
                </label>
                <input
                  name="keywords"
                  defaultValue={article?.keywords?.join(", ") ?? ""}
                  placeholder="migas, energi, perminyakan"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          name="submitAction"
          value="draft"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Draft"}
        </button>
        <button
          type="submit"
          name="submitAction"
          value="publish"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Terbitkan"}
        </button>
        {isUploading && (
          <p className="text-xs text-muted-foreground">
            Tunggu gambar selesai diunggah...
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Globe,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  publishArticle,
  archiveArticle,
  revertToDraft,
  deleteArticle,
} from "../_lib/actions";

type Props = {
  articleId: string;
  status: string;
};

export function ArticleStatusActions({ articleId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          role="button"
          aria-disabled={isPending}
          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
          <span className="sr-only">Aksi</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Aksi Artikel
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Edit */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/articles/${articleId}`} className="flex items-center">
            <Pencil className="size-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Status transitions */}
        {status === "DRAFT" && (
          <DropdownMenuItem
            className="text-emerald-600"
            onClick={() =>
              startTransition(async () => {
                await publishArticle(articleId);
                router.refresh();
              })
            }
          >
            <Globe className="size-4 mr-2" />
            Terbitkan
          </DropdownMenuItem>
        )}

        {status === "PUBLISHED" && (
          <>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  await revertToDraft(articleId);
                  router.refresh();
                })
              }
            >
              <RotateCcw className="size-4 mr-2" />
              Kembalikan ke Draft
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-amber-600"
              onClick={() =>
                startTransition(async () => {
                  await archiveArticle(articleId);
                  router.refresh();
                })
              }
            >
              <Archive className="size-4 mr-2" />
              Arsipkan
            </DropdownMenuItem>
          </>
        )}

        {status === "ARCHIVED" && (
          <>
            <DropdownMenuItem
              className="text-emerald-600"
              onClick={() =>
                startTransition(async () => {
                  await publishArticle(articleId);
                  router.refresh();
                })
              }
            >
              <Globe className="size-4 mr-2" />
              Terbitkan Ulang
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  await revertToDraft(articleId);
                  router.refresh();
                })
              }
            >
              <RotateCcw className="size-4 mr-2" />
              Kembalikan ke Draft
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Delete — DRAFT and ARCHIVED only */}
        {status !== "PUBLISHED" && (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              if (confirm("Hapus artikel ini secara permanen?")) {
                startTransition(async () => {
                  await deleteArticle(articleId);
                  router.refresh();
                });
              }
            }}
          >
            <Trash2 className="size-4 mr-2" />
            Hapus
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Shield,
  User as UserIcon,
  Archive,
  Eye,
  UserCog,
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
  verifyUser,
  rejectUser,
  setUserPending,
  archiveUser,
  deleteUser,
} from "../_lib/actions";

type Props = {
  userId: string;
  status: string;
  role: string;
  isCurrentUser: boolean;
  isArchived?: boolean;
};

export function UserStatusActions({ userId, status, role, isCurrentUser, isArchived }: Props) {
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
            Aksi Pengguna
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Lihat Detail */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${userId}`} className="flex items-center">
            <Eye className="size-4 mr-2" />
            Lihat Detail
          </Link>
        </DropdownMenuItem>

        {/* Ubah Role - only for non-current user */}
        {!isCurrentUser && !isArchived && (
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${userId}?tab=role`} className="flex items-center">
              <UserCog className="size-4 mr-2" />
              Ubah Role
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Status transitions - only for non-archived and non-current users */}
        {!isArchived && !isCurrentUser && (
          <>
            {status === "PENDING" && (
              <>
                <DropdownMenuItem
                  className="text-emerald-600"
                  onClick={() =>
                    startTransition(async () => {
                      await verifyUser(userId);
                      router.refresh();
                    })
                  }
                >
                  <CheckCircle className="size-4 mr-2" />
                  Verifikasi
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    startTransition(async () => {
                      await rejectUser(userId);
                      router.refresh();
                    })
                  }
                >
                  <XCircle className="size-4 mr-2" />
                  Tolak
                </DropdownMenuItem>
              </>
            )}

            {status === "VERIFIED" && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    startTransition(async () => {
                      await setUserPending(userId);
                      router.refresh();
                    })
                  }
                >
                  <Clock className="size-4 mr-2" />
                  Kembalikan ke Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    startTransition(async () => {
                      await rejectUser(userId);
                      router.refresh();
                    })
                  }
                >
                  <XCircle className="size-4 mr-2" />
                  Tolak
                </DropdownMenuItem>
              </>
            )}

            {status === "REJECTED" && (
              <DropdownMenuItem
                className="text-emerald-600"
                onClick={() =>
                  startTransition(async () => {
                    await verifyUser(userId);
                    router.refresh();
                  })
                }
              >
                <CheckCircle className="size-4 mr-2" />
                Verifikasi Ulang
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
          </>
        )}

        {/* Arsipkan - soft delete, available for non-archived, non-current, non-superadmin */}
        {!isArchived && !isCurrentUser && role !== "SUPER_ADMIN" && (
          <DropdownMenuItem
            className="text-amber-600"
            onClick={() => {
              if (confirm("Arsipkan pengguna ini? Pengguna yang diarsipkan dapat dihapus permanen.")) {
                startTransition(async () => {
                  await archiveUser(userId);
                  router.refresh();
                });
              }
            }}
          >
            <Archive className="size-4 mr-2" />
            Arsipkan
          </DropdownMenuItem>
        )}

        {/* Delete - only for archived users */}
        {isArchived && !isCurrentUser && (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              if (confirm("HAPUS PERMANEN? Tindakan ini tidak dapat dibatalkan.")) {
                startTransition(async () => {
                  await deleteUser(userId);
                  router.refresh();
                });
              }
            }}
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}

        {/* Show info for SUPER_ADMIN */}
        {role === "SUPER_ADMIN" && (
          <DropdownMenuItem disabled className="text-muted-foreground">
            <Shield className="size-4 mr-2" />
            Super Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

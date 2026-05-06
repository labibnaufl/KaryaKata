"use client";

import { useActionState, useState, useRef } from "react";
import { User, Shield, Users, UserCheck, UserX, UserMinus } from "lucide-react";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
type UserStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  role: UserRole;
  status: UserStatus;
}

type Props = {
  action: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  user?: UserData;
  isEditing?: boolean;
};

const roles: { value: UserRole; label: string; icon: typeof User; description: string }[] = [
  { value: "USER", label: "User", icon: User, description: "Pengguna biasa yang dapat membaca dan berkomentar" },
  { value: "ADMIN", label: "Admin", icon: Users, description: "Dapat mengelola artikel dan pengguna" },
  { value: "SUPER_ADMIN", label: "Super Admin", icon: Shield, description: "Akses penuh ke semua fitur sistem" },
];

const statuses: { value: UserStatus; label: string; icon: typeof UserCheck; description: string; color: string }[] = [
  { value: "PENDING", label: "Pending", icon: UserMinus, description: "Menunggu verifikasi admin", color: "text-amber-600" },
  { value: "VERIFIED", label: "Verified", icon: UserCheck, description: "Pengguna terverifikasi", color: "text-emerald-600" },
  { value: "REJECTED", label: "Rejected", icon: UserX, description: "Pendaftaran ditolak", color: "text-red-600" },
];

export function UserForm({ action, user, isEditing }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.image ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAvatarUrl(data.url);
      setAvatarPreview(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Main Column ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="Masukkan nama lengkap..."
              defaultValue={user?.name}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              defaultValue={user?.email}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Password (required for new, optional for edit) */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {isEditing ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
              {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <input
              name={isEditing ? "newPassword" : "password"}
              type="password"
              placeholder={isEditing ? "Minimal 6 karakter..." : "Buat password..."}
              required={!isEditing}
              minLength={6}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Bio
            </label>
            <textarea
              name="bio"
              placeholder="Ceritakan sedikit tentang diri Anda..."
              defaultValue={user?.bio ?? ""}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Maksimal 500 karakter</p>
          </div>
        </div>

        {/* ---- Sidebar Column ---- */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-2">
              Foto Profil
            </label>
            <div className="flex flex-col items-center gap-3">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover bg-muted"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-8 text-muted-foreground" />
                </div>
              )}
              <input type="hidden" name="image" value={avatarUrl} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarPreview(URL.createObjectURL(file));
                    handleAvatarUpload(file);
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isUploading ? "Mengunggah..." : avatarPreview ? "Ganti Foto" : "Upload Foto"}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-3">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      user?.role === role.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      defaultChecked={user?.role === role.value || (!user && role.value === "USER")}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{role.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-3">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {statuses.map((status) => {
                const Icon = status.icon;
                return (
                  <label
                    key={status.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      user?.status === status.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      defaultChecked={user?.status === status.value || (!user && status.value === "PENDING")}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${status.color}`} />
                        <span className="font-medium text-sm">{status.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {status.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Pengguna"}
        </button>
        {isUploading && (
          <p className="text-xs text-muted-foreground">
            Tunggu foto selesai diunggah...
          </p>
        )}
      </div>
    </form>
  );
}

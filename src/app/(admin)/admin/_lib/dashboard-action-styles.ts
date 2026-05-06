export function getActionStyle(action: string): { label: string; color: string } {
  // Strip entity prefix (e.g., "ARTICLE_CREATED" → "CREATED", "USER_UPDATE" → "UPDATE")
  const actionOnly = action.includes("_") ? action.split("_").slice(1).join("_") : action;
  
  const styles: Record<string, { label: string; color: string }> = {
    // GREEN - Create, Verify, Publish
    CREATE: { label: "Buat", color: "bg-emerald-100 text-emerald-700" },
    CREATED: { label: "Buat", color: "bg-emerald-100 text-emerald-700" },
    PUBLISH: { label: "Terbitkan", color: "bg-emerald-100 text-emerald-700" },
    PUBLISHED: { label: "Terbitkan", color: "bg-emerald-100 text-emerald-700" },
    VERIFIED: { label: "Verifikasi", color: "bg-emerald-100 text-emerald-700" },
    USER_VERIFIED: { label: "Verifikasi", color: "bg-emerald-100 text-emerald-700" },
    VERIFY_USER: { label: "Verifikasi", color: "bg-emerald-100 text-emerald-700" },
    UPDATE_STATUS: { label: "Verifikasi", color: "bg-emerald-100 text-emerald-700" },
    
    // BLUE - Update, Change Role
    UPDATE: { label: "Edit", color: "bg-blue-100 text-blue-700" },
    UPDATED: { label: "Edit", color: "bg-blue-100 text-blue-700" },
    USER_ROLE_CHANGED: { label: "Ubah Role", color: "bg-blue-100 text-blue-700" },
    CHANGE_ROLE: { label: "Ubah Role", color: "bg-blue-100 text-blue-700" },
    
    // GREY - Archive
    ARCHIVE: { label: "Arsipkan", color: "bg-gray-100 text-gray-600" },
    ARCHIVED: { label: "Arsipkan", color: "bg-gray-100 text-gray-600" },
    ARCHIVE_USER: { label: "Arsipkan", color: "bg-gray-100 text-gray-600" },
    
    // YELLOW - Draft, Pending
    DRAFT: { label: "Draft", color: "bg-amber-100 text-amber-700" },
    PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700" },
    
    // RED - Delete, Reject
    DELETE: { label: "Hapus", color: "bg-red-100 text-red-700" },
    DELETED: { label: "Hapus", color: "bg-red-100 text-red-700" },
    SOFT_DELETED: { label: "Hapus (Soft)", color: "bg-red-100 text-red-700" },
    HARD_DELETED: { label: "Hapus (Permanent)", color: "bg-red-100 text-red-700" },
    DELETE_USER: { label: "Hapus", color: "bg-red-100 text-red-700" },
    REJECTED: { label: "Tolak", color: "bg-red-100 text-red-700" },
    USER_REJECTED: { label: "Tolak", color: "bg-red-100 text-red-700" },
    REJECT_USER: { label: "Tolak", color: "bg-red-100 text-red-700" },
    REJECT: { label: "Tolak", color: "bg-red-100 text-red-700" },
  };

  // Try actionOnly first, then full action
  return (
    styles[actionOnly] ?? 
    styles[action] ?? {
      label: actionOnly,
      color: "bg-gray-100 text-gray-600",
    }
  );
}

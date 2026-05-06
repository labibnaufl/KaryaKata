"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createUser as createUserModel,
  updateUser as updateUserModel,
  updateUserPassword,
  softDeleteUser,
  hardDeleteUser,
  restoreUser,
  findUserById,
  checkEmailExists,
} from "@/models/user";
import { createLog } from "@/models/admin-log";
import type { UserRole, UserStatus } from "@/types";

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

async function requireSuperAdminAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only SUPER_ADMIN can perform this action");
  }
  return session;
}

// ==================
// Validation Schema
// ==================
const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  bio: z.string().optional(),
});

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
    await createLog(data.adminId, `${data.entity}_${data.action}`, data.entity, data.entityId, data.details);
  } catch (error) {
    console.error("[Admin Log Error]", error);
  }
}

// ==================
// CREATE
// ==================
export async function createUser(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as UserRole,
    status: formData.get("status") as UserStatus,
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password, role, status } = parsed.data;

  // Check email uniqueness
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return { error: "Email sudah terdaftar" };
  }

  // Only SUPER_ADMIN can create SUPER_ADMIN
  if (role === "SUPER_ADMIN") {
    await requireSuperAdminAction();
  }

  try {
    const user = await createUserModel({
      name,
      email,
      password,
      role,
      status,
    });

    await createAdminLog({
      adminId: session.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: `Created user: "${name}" (${email}) with role ${role}`,
    });

    revalidatePath("/admin/users");
    redirect("/admin/users");
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "Failed to create user" };
  }
}

// ==================
// UPDATE
// ==================
export async function updateUser(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  const existingUser = await findUserById(id);
  if (!existingUser) return { error: "User tidak ditemukan." };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as UserRole,
    status: formData.get("status") as UserStatus,
    bio: formData.get("bio") as string,
    image: formData.get("image") as string,
  };

  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, role, status, bio, image } = parsed.data;

  // Check email uniqueness (exclude current user)
  if (email !== existingUser.email) {
    const emailExists = await checkEmailExists(email, id);
    if (emailExists) {
      return { error: "Email sudah digunakan oleh user lain" };
    }
  }

  // Only SUPER_ADMIN can change role to/from SUPER_ADMIN
  if (role === "SUPER_ADMIN" || existingUser.role === "SUPER_ADMIN") {
    await requireSuperAdminAction();
  }

  // Prevent self-demotion (can't change own role)
  if (id === session.user.id && role !== existingUser.role) {
    return { error: "Tidak dapat mengubah role diri sendiri" };
  }

  try {
    await updateUserModel(id, {
      name,
      email,
      role,
      status,
      bio: bio || null,
      image: image || null,
    });

    // Handle password update if provided
    const newPassword = formData.get("newPassword") as string;
    if (newPassword && newPassword.length >= 6) {
      await updateUserPassword(id, newPassword);
    }

    await createAdminLog({
      adminId: session.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      details: `Updated user: "${name}" (${email})`,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    redirect("/admin/users");
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update user" };
  }
}

// ==================
// UPDATE STATUS
// ==================
export async function updateUserStatus(id: string, status: UserStatus) {
  const session = await requireAdminAction();

  const user = await findUserById(id);
  if (!user) throw new Error("User not found");

  // Prevent self-status change
  if (id === session.user.id) {
    throw new Error("Tidak dapat mengubah status diri sendiri");
  }

  await updateUserModel(id, { status });

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE_STATUS",
    entity: "User",
    entityId: id,
    details: `Changed status to ${status}: "${user.name}"`,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function verifyUser(id: string) {
  return updateUserStatus(id, "VERIFIED");
}

export async function rejectUser(id: string) {
  return updateUserStatus(id, "REJECTED");
}

export async function setUserPending(id: string) {
  return updateUserStatus(id, "PENDING");
}

// ==================
// ARCHIVE (Soft Delete)
// ==================
export async function archiveUser(id: string) {
  const session = await requireAdminAction();

  const user = await findUserById(id);
  if (!user) throw new Error("User not found");

  // Prevent self-archive
  if (id === session.user.id) {
    throw new Error("Tidak dapat mengarsipkan diri sendiri");
  }

  // Only SUPER_ADMIN can archive SUPER_ADMIN
  if (user.role === "SUPER_ADMIN") {
    await requireSuperAdminAction();
  }

  await softDeleteUser(id);

  await createAdminLog({
    adminId: session.user.id,
    action: "ARCHIVE",
    entity: "User",
    entityId: id,
    details: `Archived user: "${user.name}" (${user.email})`,
  });

  revalidatePath("/admin/users");
}

// ==================
// DELETE (Hard Delete - Only for archived users)
// ==================
export async function deleteUser(id: string) {
  const session = await requireAdminAction();

  const user = await findUserById(id);
  if (!user) return;

  // Prevent self-deletion
  if (id === session.user.id) {
    throw new Error("Tidak dapat menghapus diri sendiri");
  }

  // Only SUPER_ADMIN can delete SUPER_ADMIN
  if (user.role === "SUPER_ADMIN") {
    await requireSuperAdminAction();
  }

  // Only allow deletion of archived users (soft deleted)
  if (!user.deletedAt) {
    throw new Error("Hanya pengguna yang diarsipkan yang dapat dihapus permanen");
  }

  await hardDeleteUser(id);

  await createAdminLog({
    adminId: session.user.id,
    action: "DELETE",
    entity: "User",
    entityId: id,
    details: `Permanently deleted user: "${user.name}" (${user.email})`,
  });

  revalidatePath("/admin/users");
}

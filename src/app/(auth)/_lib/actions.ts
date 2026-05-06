"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/models/user";
import { slugify } from "@/lib/utils";

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(255, "Nama maksimal 255 karakter"),
    email: z
      .string()
      .email("Email tidak valid")
      .max(255, "Email maksimal 255 karakter"),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .max(255, "Password maksimal 255 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

// ============================================================
// REGISTER ACTION
// ============================================================

export type RegisterResult =
  | { success: true; userId: string }
  | { success: false; error: string };

export async function registerUser(
  formData: FormData
): Promise<RegisterResult> {
  try {
    // Parse and validate input
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parseResult = registerSchema.safeParse(rawData);

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validasi gagal";
      return { success: false, error: firstError };
    }

    const { name, email, password } = parseResult.data;

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique slug from name
    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // Create user with PENDING status (requires admin verification)
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: "USER",
      status: "PENDING",
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Terjadi kesalahan saat mendaftar" };
  }
}

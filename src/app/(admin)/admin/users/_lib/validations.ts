import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional().or(z.literal("")),
  image: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  newPassword: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

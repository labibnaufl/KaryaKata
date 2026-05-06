"use server";

import { findUserByEmail } from "@/models/user";
import bcrypt from "bcryptjs";

export async function debugLogin(email: string, password: string) {
  console.log("=== DEBUG LOGIN ===");
  console.log("Email:", email);
  
  const user = await findUserByEmail(email);
  console.log("User found:", user ? "YES" : "NO");
  
  if (user) {
    console.log("User ID:", user.id);
    console.log("User Role:", user.role);
    console.log("User Status:", user.status);
    console.log("Password hash:", user.password.substring(0, 30) + "...");
    console.log("Deleted:", user.deletedAt);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValid);
  }
  
  console.log("===================");
  return { success: !!user, user: user ? { id: user.id, email: user.email, role: user.role } : null };
}

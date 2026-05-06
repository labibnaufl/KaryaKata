import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, uploadAvatarImage } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "article";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Only admins can upload article images
    if (type === "article") {
      if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const folder = (formData.get("folder") as string) || "karyakata/articles";
      const url = await uploadImage(file, folder);
      return NextResponse.json({ url });
    } else if (type === "avatar") {
      // Any authenticated user can upload avatar
      const folder = (formData.get("folder") as string) || "karyakata/avatars";
      const result = await uploadAvatarImage(file, folder);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}

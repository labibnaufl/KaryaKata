import { updateUser } from "../_lib/actions";
import { UserForm } from "../_components/user-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getUserByIdWithDetails } from "@/models/user";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUserByIdWithDetails(id);

  if (!user) notFound();

  // Bind updateUser to this specific user id
  const updateBound = updateUser.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-xl font-bold font-heading">Edit Pengguna</h1>
      </div>

      <UserForm 
        action={updateBound} 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          role: user.role,
          status: user.status,
        }} 
        isEditing 
      />
    </div>
  );
}

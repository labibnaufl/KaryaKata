"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setIsPending(false);
        return;
      }

      // Check user role and redirect accordingly
      const session = await fetch("/api/auth/session").then((res) => res.json());
      const userRole = session?.user?.role;

      // Redirect admin to admin dashboard, regular users to home
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#000000]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          required
          className="border-[#E0E0EB] focus:border-[#000000] focus:ring-[#000000]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#000000]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          className="border-[#E0E0EB] focus:border-[#000000] focus:ring-[#000000]"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#000000] hover:bg-[#2E1A8B] text-white"
      >
        {isPending ? "Memuat..." : "Masuk"}
      </Button>
    </form>
  );
}

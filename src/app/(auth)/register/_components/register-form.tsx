"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { registerUser } from "../../_lib/actions";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await registerUser(formData);

      if (!result.success) {
        setError(result.error || "Terjadi kesalahan saat mendaftar");
        setIsPending(false);
        return;
      }

      setSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-[#000000]">
          Pendaftaran Berhasil!
        </h3>
        <p className="text-muted-foreground">
          Akun Anda sedang menunggu verifikasi admin.\nAnda akan diarahkan ke halaman login...
        </p>
      </div>
    );
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
        <Label htmlFor="name" className="text-[#000000]">
          Nama Lengkap
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          minLength={2}
          className="border-[#E0E0EB] focus:border-[#000000] focus:ring-[#000000]"
        />
      </div>

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
          placeholder="Minimal 6 karakter"
          required
          minLength={6}
          className="border-[#E0E0EB] focus:border-[#000000] focus:ring-[#000000]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#000000]">
          Konfirmasi Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password"
          required
          minLength={6}
          className="border-[#E0E0EB] focus:border-[#000000] focus:ring-[#000000]"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#000000] hover:bg-[#2E1A8B] text-white"
      >
        {isPending ? "Mendaftar..." : "Daftar"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Dengan mendaftar, Anda menyetujui{" "}
        <a href="#" className="text-[#000000] hover:underline">
          Syarat dan Ketentuan
        </a>{" "}
        kami.
      </p>
    </form>
  );
}

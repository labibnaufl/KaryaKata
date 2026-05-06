import type { Metadata } from "next";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Daftar akun Karya Kata. baru",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-[#000000]">
            Karya Kata.
          </h1>
          <p className="text-muted-foreground">
            Bergabung dengan komunitas pembaca dan penulis
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E0E0EB]">
          <h2 className="text-2xl font-semibold text-[#000000] mb-6 text-center">
            Buat Akun Baru
          </h2>
          <RegisterForm />
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-medium text-[#000000] hover:text-[#2E1A8B] underline underline-offset-4"
          >
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}

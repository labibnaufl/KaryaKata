import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login ke akun Karya Kata. Anda",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-[#000000]">
            Karya Kata.
          </h1>
          <p className="text-muted-foreground">
            Platform artikel modern untuk komunitas pembaca dan penulis
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E0E0EB]">
          <h2 className="text-2xl font-semibold text-[#000000] mb-6 text-center">
            Masuk ke Akun
          </h2>
          <LoginForm />
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-[#000000] hover:text-[#2E1A8B] underline underline-offset-4"
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
}

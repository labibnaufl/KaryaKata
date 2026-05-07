"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Articles page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-7xl md:text-8xl font-black text-black/10 mb-2 tracking-tighter">
          ERROR
        </h1>

        <h2 className="font-heading text-3xl md:text-4xl font-normal text-black mb-6">
          Terjadi Kesalahan
        </h2>

        <p className="font-sans text-black/60 mb-10 leading-relaxed">
          Maaf, kami tidak dapat memuat halaman artikel saat ini.<br />
          Silakan coba lagi atau kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans font-semibold text-sm uppercase tracking-widest hover:bg-black/80 transition-colors duration-300"
          >
            Coba Lagi
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 border border-black text-black font-sans font-semibold text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

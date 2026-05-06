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
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-3xl md:text-4xl font-normal mb-4">
          Terjadi Kesalahan
        </h2>
        <p className="font-sans text-black/60 mb-8">
          Maaf, kami tidak dapat memuat halaman artikel. Silakan coba lagi.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black text-white font-sans font-medium rounded-sm hover:bg-black/80 transition-colors"
          >
            Coba Lagi
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 border border-black text-black font-sans font-medium rounded-sm hover:bg-black/5 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

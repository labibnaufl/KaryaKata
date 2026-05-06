import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-6xl font-black text-black/10 mb-4">
          404
        </h1>
        <h2 className="font-heading text-2xl font-normal text-black mb-4">
          Artikel Tidak Ditemukan
        </h2>
        <p className="font-sans text-black/60 mb-8">
          Maaf, artikel yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/articles"
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-sans text-sm uppercase tracking-wider hover:bg-black/80 transition-colors"
          >
            Lihat Semua Artikel
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-black text-black font-sans text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

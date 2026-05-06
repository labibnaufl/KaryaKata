"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Import images from src/images
import businessImg from "@/images/Business.jpg";
import lifestyleImg from "@/images/lifestyle.jpg";
import aiImg from "@/images/AI.jpg";
import creativityImg from "@/images/Creativity.jpg";
import educationImg from "@/images/Educationjpg.jpg";

// ── Data Kategori ───────────────────────────────────────────────────────────
const KATEGORI = [
  {
    label: "Bisnis",
    slug: "bisnis",
    nomor: "01",
    deskripsi:
      "Rubrik Bisnis menghadirkan kisah para pelaku usaha, strategi pertumbuhan, dan tren pasar yang membentuk ekonomi masa kini. Dari startup yang merintis jalan hingga korporasi yang bertransformasi, kami meliput setiap langkah perjalanan bisnis dengan tajam dan mendalam.",
    image: businessImg,
    warna: "#0e0e0e",
  },
  {
    label: "Gaya Hidup",
    slug: "gaya-hidup",
    nomor: "02",
    deskripsi:
      "Gaya Hidup menyoroti bagaimana pilihan sehari-hari—dari desain rumah, mode, hingga kebiasaan sehat—mencerminkan nilai dan identitas kita. Temukan inspirasi hidup yang autentik, berkelanjutan, dan penuh makna di tengah dunia yang terus bergerak.",
    image: lifestyleImg,
    warna: "#0e0e0e",
  },
  {
    label: "Kecerdasan Buatan",
    slug: "kecerdasan-buatan",
    nomor: "03",
    deskripsi:
      "Kecerdasan Buatan membedah perkembangan AI dari sudut pandang yang manusiawi. Kami mengulas bagaimana teknologi ini mengubah cara kita bekerja, berkreasi, dan berinteraksi—sekaligus mengajak pembaca berpikir kritis tentang masa depan yang sedang kita rancang bersama.",
    image: aiImg,
    warna: "#0e0e0e",
  },
  {
    label: "Kreativitas",
    slug: "kreativitas",
    nomor: "04",
    deskripsi:
      "Kreativitas merayakan para seniman, desainer, penulis, dan pemikir yang mendorong batas-batas ekspresi manusia. Dari seni kontemporer hingga desain fungsional, rubrik ini adalah ruang bagi ide-ide yang berani dan karya yang tak terlupakan.",
    image: creativityImg,
    warna: "#0e0e0e",
  },
  {
    label: "Pendidikan",
    slug: "pendidikan",
    nomor: "05",
    deskripsi:
      "Pendidikan mengeksplorasi cara belajar yang terus berevolusi—dari ruang kelas tradisional hingga platform digital. Kami percaya bahwa pengetahuan adalah hak semua orang, dan setiap cerita di sini adalah undangan untuk terus tumbuh dan bertanya.",
    image: educationImg,
    warna: "#0e0e0e",
  },
];

// ── Variants ────────────────────────────────────────────────────────────────
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.33, 1, 0.68, 1] as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: [0.76, 0, 0.24, 1] as const } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] as const } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] as const } },
};

// ── Komponen Utama ──────────────────────────────────────────────────────────
export function FeaturedSection() {
  const [aktif, setAktif] = useState(0);
  const kategoriAktif = KATEGORI[aktif];

  return (
    <section
      className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2"
      style={{ backgroundColor: "#F8F4ED" }}
    >
      {/* ── Kiri: Gambar ───────────────────────────────── */}
      <div className="relative min-h-[50vw] lg:min-h-screen p-6 lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={aktif}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-6 lg:inset-10 rounded-lg overflow-hidden"
          >
            <Image
              src={kategoriAktif.image}
              alt={kategoriAktif.label}
              fill
              className="object-cover"
              priority
            />
            {/* overlay tipis agar teks di atasnya terbaca */}
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Kanan: Navigasi + Konten ────────────────────── */}
      <div className="flex flex-col px-8 md:px-12 lg:px-16 py-10 lg:py-14">

        {/* Tab navigasi + nomor */}
        <div className="flex items-start justify-between gap-4 mb-10 lg:mb-14">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {KATEGORI.map((kat, i) => (
              <button
                key={kat.slug}
                onClick={() => setAktif(i)}
                className="relative text-sm md:text-base font-sans transition-all duration-300"
                style={{
                  fontWeight: i === aktif ? 700 : 400,
                  color: i === aktif ? "#0e0e0e" : "#0e0e0e60",
                  letterSpacing: "0.01em",
                }}
              >
                {kat.label}
                {/* garis bawah aktif */}
                {i === aktif && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-black"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Nomor */}
          <AnimatePresence mode="wait">
            <motion.span
              key={aktif}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-bold font-sans shrink-0"
              style={{ color: "#0e0e0e", letterSpacing: "-0.02em" }}
            >
              {kategoriAktif.nomor}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Deskripsi */}
        <AnimatePresence mode="wait">
          <motion.div
            key={aktif}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-1 flex flex-col justify-between"
          >
            <p
              className="font-sans leading-snug mb-10"
              style={{
                fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
                color: "#0e0e0e",
                fontWeight: 400,
                maxWidth: "38rem",
              }}
            >
              {kategoriAktif.deskripsi}
            </p>

            {/* Tombol lihat artikel */}
            <div>
              <Link
                href={`/kategori/${kategoriAktif.slug}`}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-black text-white font-sans font-semibold text-sm uppercase tracking-widest hover:bg-black/80 transition-colors duration-300"
                style={{ borderRadius: "2px" }}
              >
                Lihat Artikel
                <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indikator garis bawah — mobile */}
        <div className="flex gap-2 mt-10 lg:hidden">
          {KATEGORI.map((_, i) => (
            <button
              key={i}
              onClick={() => setAktif(i)}
              className="h-[2px] transition-all duration-300"
              style={{
                flex: i === aktif ? 3 : 1,
                backgroundColor: i === aktif ? "#0e0e0e" : "#0e0e0e30",
              }}
              aria-label={`Pilih kategori ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
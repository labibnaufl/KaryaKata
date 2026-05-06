"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Artikel", href: "/articles" },
  { label: "Tentang", href: "/about" },
  { label: "Bookmark", href: "/bookmarks" },
];

const KATEGORI_LINKS = [
  { label: "Bisnis", href: "/kategori/bisnis" },
  { label: "Gaya Hidup", href: "/kategori/gaya-hidup" },
  { label: "Kecerdasan Buatan", href: "/kategori/kecerdasan-buatan" },
  { label: "Kreativitas", href: "/kategori/kreativitas" },
  { label: "Pendidikan", href: "/kategori/pendidikan" },
];

// ── Komponen ─────────────────────────────────────────────────────────────────
export function MainFooter() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  // Animation: Both come from right, then exit to separate sides
  // Phase 0: Both off-screen right
  // Phase 1: Both enter to center (side by side)
  // Phase 2: Both visible at center
  // Phase 3: Karya exits left, Kata exits right
  // Phase 4: Reset to right, loop back to phase 0
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cycle = () => {
      // Start sequence
      setTimeout(() => setPhase(1), 500);    // 0.5s: Enter from right
      setTimeout(() => setPhase(2), 2000);   // 2s: Settle at center
      setTimeout(() => setPhase(3), 5000);   // 5s: Exit to separate sides
      setTimeout(() => setPhase(0), 7000);   // 7s: Reset off-screen right
    };
    
    cycle();
    const interval = setInterval(cycle, 7000);
    
    return () => clearInterval(interval);
  }, []);

  // Parallax wordmark
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ["12%", "-4%"]);

  // Animation variants - using percentage instead of vw to stay within bounds
  const karyaVariants = {
    // Phase 0: Off-screen right (150% instead of 100vw)
    phase0: { 
      x: "150%", 
      opacity: 0,
      transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as const } 
    },
    // Phase 1: Enter to center
    phase1: { 
      x: "-0.05em", 
      opacity: 1,
      transition: { duration: 1, ease: [0.33, 1, 0.68, 1] as const } 
    },
    // Phase 2: Stay at center
    phase2: { 
      x: "-0.05em", 
      opacity: 1,
      transition: { duration: 0.3 } 
    },
    // Phase 3: Exit to left (150% instead of -100vw)
    phase3: { 
      x: "-150%", 
      opacity: 0,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] as const } 
    },
  };

  const kataVariants = {
    // Phase 0: Off-screen right (slightly behind Karya)
    phase0: { 
      x: "160%", 
      opacity: 0,
      transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as const } 
    },
    // Phase 1: Enter to center
    phase1: { 
      x: "0.05em", 
      opacity: 1,
      transition: { duration: 1, ease: [0.33, 1, 0.68, 1] as const } 
    },
    // Phase 2: Stay at center
    phase2: { 
      x: "0.05em", 
      opacity: 1,
      transition: { duration: 0.3 } 
    },
    // Phase 3: Exit to right
    phase3: { 
      x: "150%", 
      opacity: 0,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] as const } 
    },
  };

  const phaseKey = `phase${phase}` as const;

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden p-4 md:p-6"
      style={{ backgroundColor: "#F8F4ED" }}
    >
      <div
        className="border overflow-hidden"
        style={{
          borderColor: "#0e0e0e20",
          borderRadius: "24px",
        }}
      >
      {/* ── Top: Info utama ─────────────────────────────── */}
      <div
        className="relative z-10 border-b bg-[#05D9FF]"
        style={{ borderColor: "#0e0e0e20" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-0">

          {/* Kiri: newsletter */}
          <div
            className="px-8 md:px-12 py-10 border-b md:border-b-0 md:border-r"
            style={{ borderColor: "#0e0e0e20" }}
          >
            <p
              className="font-sans font-bold leading-tight mb-6"
              style={{
                fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                color: "#0e0e0e",
                maxWidth: "22rem",
              }}
            >
              Daftarkan dirimu dan dapatkan artikel pilihan langsung di kotak masukmu.
            </p>
            <Link
              href="/newsletter"
              className="group inline-flex items-center gap-3 font-sans font-bold text-sm uppercase tracking-widest hover:opacity-60 transition-opacity duration-300"
              style={{ color: "#0e0e0e" }}
            >
              Langganan newsletter
              <motion.span
                className="inline-block"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                →
              </motion.span>
            </Link>
          </div>

          {/* Tengah: navigasi */}
          <div
            className="px-8 md:px-12 py-10 border-b md:border-b-0 md:border-r"
            style={{ borderColor: "#0e0e0e20" }}
          >
            <p
              className="font-sans font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: "#0e0e0e60" }}
            >
              Navigasi
            </p>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans font-bold text-base hover:opacity-50 transition-opacity duration-200"
                    style={{ color: "#0e0e0e" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kanan: kategori */}
          <div className="px-8 md:px-12 py-10">
            <p
              className="font-sans font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: "#0e0e0e60" }}
            >
              Kategori
            </p>
            <ul className="flex flex-col gap-2">
              {KATEGORI_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans font-bold text-base hover:opacity-50 transition-opacity duration-200"
                    style={{ color: "#0e0e0e" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar: copyright ────────────────────────── */}
      <div
        className="bg-[#05D9FF] relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-8 md:px-12 py-5 border-b"
        style={{ borderColor: "#0e0e0e20" }}
      >
        <p
          className="font-sans text-xs uppercase tracking-widest"
          style={{ color: "#0e0e0e60" }}
        >
          {currentYear} © Karya Kata.
        </p>
        <p
          className="font-sans text-xs uppercase tracking-widest"
          style={{ color: "#0e0e0e40" }}
        >
          Proyek Akhir Praktikum Sistem Basis Data
        </p>
      </div>

      <div className="bg-[#05D9FF] relative overflow-hidden" style={{ height: "clamp(120px, 22vw, 320px)" }}>
        <motion.div
          style={{ y: wordmarkY }}
          className="flex items-end justify-center w-full h-full"
        >
          {/* Container for both words */}
          <div className="relative flex items-end justify-center" style={{ width: "100%" }}>
            <motion.span
              variants={karyaVariants}
              animate={phaseKey}
              className="font-heading font-black leading-none select-none whitespace-nowrap"
              style={{
                fontSize: "clamp(120px, 22vw, 320px)",
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 0.85,
                marginRight: "0.1em",
              }}
            >
              Karya
            </motion.span>
            
            <motion.span
              variants={kataVariants}
              animate={phaseKey}
              className="font-heading font-black leading-none select-none whitespace-nowrap"
              style={{
                fontSize: "clamp(120px, 22vw, 320px)",
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 0.85,
              }}
            >
              Kata.
            </motion.span>
          </div>
        </motion.div>
      </div>
      </div>
    </footer>
  );
}

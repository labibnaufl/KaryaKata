"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
type HeaderTheme = { bg: string; color: string };

const DEFAULT: HeaderTheme = { bg: "#FFFFFF", color: "#000000" };

// ── Framer Motion variants ──────────────────────────────────────────────────
const searchVariants: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0 },
  exit: { y: "-100%" },
};

const sidebarVariants: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0 },
  exit: { y: "-100%" },
};

const sidebarTransition = {
  duration: 0.6,
  ease: [0.76, 0, 0.24, 1] as const,
};

const navContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const navItemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.33, 1, 0.68, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] as const },
  },
};

const bottomVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.45, ease: [0.33, 1, 0.68, 1] as const },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Home", href: "/" },
];

// ── Close Button ────────────────────────────────────────────────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Close menu"
      onClick={onClick}
      className="group relative flex items-center justify-center hover:opacity-60 transition-opacity duration-300"
    >
      <span className="text-xl md:text-3xl font-sans font-semibold tracking-[0.25em] pl-[0.25em] uppercase text-black select-none">
        CLOSE
      </span>
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function MainHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Reset & close on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
    setSearchOpen(false);
  }

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 transition-colors duration-300"
        style={{ backgroundColor: DEFAULT.bg }}
      >
        {/* Left: spacer */}
        <div className="w-20" />

        {/* Center: Logo */}
        <Link
          href="/"
          className="text-xl md:text-2xl lg:text-3xl font-heading font-bold tracking-wide hover:opacity-60 transition-opacity duration-300"
          style={{ color: DEFAULT.color }}
        >
          Karya Kata.
        </Link>

        {/* Right: Search toggle + Menu */}
        <div className="flex items-center gap-4 w-20 justify-end">

          {/* Ikon berganti: kaca pembesar ↔ silang */}
          <button
            aria-label={searchOpen ? "Tutup pencarian" : "Buka pencarian"}
            onClick={() => {
              setSearchOpen((v) => !v);
              setSearchQuery("");
            }}
            className="hover:opacity-60 transition-opacity duration-300"
            style={{ color: DEFAULT.color }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.span
                  key="x"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <X size={20} strokeWidth={2} />
                </motion.span>
              ) : (
                <motion.span
                  key="search"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <Search size={20} strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-lg md:text-xl lg:text-2xl font-heading font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity duration-300"
            style={{ color: DEFAULT.color }}
          >
            Menu
          </button>
        </div>
      </header>

      {/* ── Search Pop Out ─────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            variants={searchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={sidebarTransition}
            className="fixed top-0 left-0 right-0 z-40 flex flex-col justify-center pt-14"
            style={{ backgroundColor: "#F8F4ED", height: "50vh" }}
          >
            <form
              onSubmit={handleSearch}
              className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-20 gap-6"
            >
              {/* Input dengan garis bawah sepanjang pop up */}
              <div className="flex flex-col gap-0">
                <input
                  type="text"
                  placeholder="Ketik pencarianmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-2xl sm:text-3xl md:text-4xl font-sans font-light bg-transparent outline-none placeholder:text-black/25 text-black pb-4 transition-colors"
                  autoFocus
                />
                {/* Garis bawah penuh — mengikuti lebar pop up */}
                <div className="w-full border-b-2 border-black/15" />
              </div>

              {/* Hint + tombol submit */}
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-sans font-bold tracking-[0.2em] uppercase text-black/40">
                  Tekan Enter untuk mencari
                </p>
                <button
                  type="submit"
                  className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-black hover:bg-black/80 transition-colors duration-300 rounded-sm"
                  aria-label="Submit search"
                >
                  <Search
                    size={20}
                    strokeWidth={1.5}
                    className="text-white transition-transform duration-300 group-hover:scale-110"
                  />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar 90vh dari atas ─────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            aria-label="Navigation sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={sidebarTransition}
            className="fixed top-0 left-0 right-0 z-[60] flex flex-col"
            style={{ backgroundColor: "#05D9FF", height: "90vh" }}
          >
            {/* ── Top bar: Close button ── */}
            <div className="flex items-center justify-end px-8 h-28 shrink-0">
              <CloseButton onClick={() => setSidebarOpen(false)} />
            </div>

            {/* ── Nav links ── */}
            <motion.nav
              className="flex flex-col px-8 md:px-16 lg:px-20 pt-8 md:pt-12 flex-1"
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {NAV_LINKS.map(({ label, href }) => (
                <motion.div key={label} variants={navItemVariants}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className="block font-sans font-light text-black hover:opacity-40 transition-opacity pt-6 md:pt-10 duration-200 uppercase leading-none"
                    style={{
                      fontSize: "clamp(3rem, 9vw, 7rem)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* ── Bottom bar ── */}
            <motion.div
              variants={bottomVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="shrink-0 px-8 md:px-16 lg:px-20 pb-8 md:pb-10"
            >
              <div className="w-full border-t border-black/30 mb-5" />

              <div className="flex items-end sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <p
                    className="font-sans font-bold text-black uppercase tracking-tight leading-none"
                    style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}
                  >
                    Karya Kata.
                  </p>
                </div>

                <Link
                  href="/about"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Go to About"
                  className="group flex shrink-0 items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black hover:bg-black/80 transition-colors duration-300"
                  style={{ borderRadius: "4px" }}
                >
                  <span className="text-white text-2xl font-light transition-transform duration-300 group-hover:translate-x-1 inline-block">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
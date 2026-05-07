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

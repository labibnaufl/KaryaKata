"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface HeroArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage?: string | null;
  categoryName?: string | null;
  category?: {
    name: string;
  };
}

interface HeroSectionProps {
  articles?: HeroArticle[];
}

export function HeroSection({ articles = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Use robust dummy data matching the reference design if props are empty
  const displayArticles = articles.length > 0 ? articles : [
    {
      id: "1",
      title: "On Transforms Air Pollution into High-Performance Running Gear",
      slug: "#",
      excerpt: "Discover the new era of sustainable performance wear.",
      coverImage: "https://images.unsplash.com/photo-1552674605-db6aea1128ea?q=80&w=2070&auto=format&fit=crop",
      categoryName: "Fashion"
    },
    {
      id: "2",
      title: "Golden Globe Winner Billie Eilish Talks Thrifting and Climate Change in Her Signature Grunge Style",
      slug: "#",
      excerpt: "An exclusive interview on sustainable fashion.",
      coverImage: "https://images.unsplash.com/photo-1612282130134-2b217e657c7d?q=80&w=1964&auto=format&fit=crop",
      categoryName: "Article"
    },
    {
      id: "3",
      title: "The Future of Minimalist Design in Urban Architecture",
      slug: "#",
      excerpt: "How less is becoming more in modern cityscapes.",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      categoryName: "Architecture"
    },
    {
      id: "4",
      title: "Mastering the Art of Mindful Photography",
      slug: "#",
      excerpt: "Capture moments with intention and clarity.",
      coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
      categoryName: "Photography"
    }
  ];

  // Auto-rotate every 5 seconds (pause on hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayArticles.length, isHovered]);

  const main = displayArticles[currentIndex];
  const mainCategoryName = main?.categoryName || main?.category?.name || "Article";

  // The rest of the articles for the stacked cards UI
  const otherArticles = displayArticles.length > 1 ? [
    ...displayArticles.slice(currentIndex + 1),
    ...displayArticles.slice(0, currentIndex)
  ] : [];

  return (
    <section className="relative w-full h-[90vh] md:h-[95vh] min-h-[600px] bg-[#1A1A1A] overflow-hidden font-sans group">
      {/* ── Background Image ── */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`bg-${main?.id}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0.6, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className="absolute inset-0 bg-black/30 md:bg-black/20 z-10" /> 
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main?.coverImage || "https://images.unsplash.com/photo-1552674605-db6aea1128ea?q=80&w=2070&auto=format&fit=crop"}
            alt={main?.title}
            className="w-full h-full object-cover object-top md:object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Main Content Container ── */}
      <div className="relative z-20 w-full h-full px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-12 md:pb-20 max-w-[1600px] mx-auto">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 w-full">
          
          {/* ── Left Side: Tags & Big Title ── */}
          <div className="flex-1 max-w-[800px] relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`content-${main?.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              >
                <div className="flex items-center gap-1.5 mb-5 md:mb-6">
                  <span className="px-3 md:px-4 py-1 md:py-1.5 bg-white text-black text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm">
                    Article
                  </span>
                  <span className="px-3 md:px-4 py-1 md:py-1.5 bg-white text-black text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm max-w-[120px] truncate">
                    {mainCategoryName}
                  </span>
                  <Link 
                    href={`/articles/${main?.slug}`}
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 bg-white text-black rounded-full hover:bg-black hover:text-white transition-colors duration-300 ml-1"
                    aria-label="Read article"
                  >
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>

                <Link href={`/articles/${main?.slug}`} className="block group/title">
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight group-hover/title:text-white/80 transition-colors duration-300 line-clamp-3">
                    {main?.title}
                  </h1>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right Side: Circular Indicator & Stacked Cards ── */}
          <div className="relative shrink-0 flex items-end gap-12 md:gap-16">
            


            {/* Stacked Cards UI */}
            <div 
              className="relative w-full max-w-[360px] md:w-[380px] h-[130px] md:h-[140px] mt-8 lg:mt-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence>
                {otherArticles.map((article, i) => {
                  const categoryName = article.categoryName || article.category?.name || "Article";
                  const isVisible = i < 3; // Show max 3 stacked cards
                  
                  if (!isVisible) return null;

                  // Positions when NOT hovered (stacked effect)
                  const yNotHovered = i * -12;
                  const scaleNotHovered = 1 - i * 0.05;
                  const opacityNotHovered = 1 - i * 0.2;

                  // Positions when HOVERED (fanned out vertically upwards)
                  const yHovered = i * -155;
                  const scaleHovered = 1;
                  const opacityHovered = 1;

                  return (
                    <motion.div
                      layout
                      key={`stack-card-${article.id}`}
                      initial={false}
                      animate={{
                        y: isHovered ? yHovered : yNotHovered,
                        scale: isHovered ? scaleHovered : scaleNotHovered,
                        opacity: isHovered ? opacityHovered : opacityNotHovered,
                        zIndex: 30 - i
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-x-0 bottom-0 h-[130px] md:h-[140px]"
                    >
                      <Link 
                        href={`/articles/${article.slug}`}
                        className="block w-full h-full bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-3 md:p-4 group/card border border-black/5"
                      >
                        <div className="flex gap-4 h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={article.coverImage || "https://images.unsplash.com/photo-1612282130134-2b217e657c7d?q=80&w=1964&auto=format&fit=crop"} 
                            alt={article.title}
                            className="w-20 md:w-24 h-full object-cover rounded-md shrink-0 bg-gray-200"
                          />
                          <div className="flex flex-col justify-between py-1 overflow-hidden flex-1">
                            <h3 className="text-black font-bold text-sm md:text-[15px] leading-[1.25] tracking-tight line-clamp-3">
                              {article.title}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] text-black/60 uppercase truncate max-w-[100px]">
                                {categoryName}
                              </span>
                              <ArrowRight size={14} className="text-black group-hover/card:translate-x-1 transition-transform shrink-0" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

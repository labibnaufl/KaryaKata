"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Add animation to images when they come into view
  useEffect(() => {
    if (!contentRef.current) return;

    const images = contentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.classList.add("opacity-0", "transition-opacity", "duration-500");
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            img.classList.remove("opacity-0");
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(img);
    });
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={contentRef}
      className="prose prose-lg max-w-none font-sans text-black/90 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Parallax effect for left side
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section
      ref={sectionRef}
      className="home-push grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-8 md:px-12 lg:px-20 py-20 md:py-32 bg-[#F8F4ED]"
    >
      {/* Left Side - Tagline with parallax */}
      <motion.div 
        className="left"
        style={{ y }}
      >
        <h3 className="tagline font-sans text-sm md:text-base uppercase tracking-widest text-black/60 max-w-xs">
          Langkah inovatif dalam teknologi untuk menciptakan dampak yang berarti.
        </h3>
      </motion.div>

      {/* Right Side - Description + Button */}
      <div className="right flex flex-col gap-8">
        <p className="font-heading text-xl md:text-2xl lg:text-3xl font-normal text-black leading-relaxed max-w-2xl">
          Kami menghadirkan narasi inspiratif seputar teknologi dan masa depan—tentang ide, inovasi, dan dampak nyata. Kami mendukung para pembuat perubahan yang berani melangkah lebih jauh.
        </p>

        {/* 3D Button with hover effect */}
        <Link
          href="/about-us"
          className="ui-button group inline-flex items-center self-start"
        >
          <span className="inner relative overflow-hidden px-8 py-4 bg-black text-white font-sans text-sm uppercase tracking-widest">
            {/* Main text */}
            <span className="relative z-10">
              Masuk
            </span>
            
            {/* Clone - top slide */}
            <span 
              className="clone -top absolute inset-0 flex items-center justify-center bg-[#05D9FF] text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              aria-hidden="true"
            >
              Masuk
            </span>
            
            {/* Clone - bottom slide */}
            <span 
              className="clone -bottom absolute inset-0 flex items-center justify-center bg-[#05D9FF] text-white -translate-y-full group-hover:translate-y-0 transition-transform duration-300 delay-75"
              aria-hidden="true"
            >
              Masuk
            </span>
            
            {/* Clone - back slide (for depth) */}
            <span 
              className="clone -back absolute inset-0 flex items-center justify-center bg-[#05D9FF] text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 delay-150"
              aria-hidden="true"
            >
              Masuk
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

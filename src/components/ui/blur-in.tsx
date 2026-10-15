"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type BlurInTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "li" | "blockquote";

interface BlurIntProps {
  word: string;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
  /** Element to render. Only the page's main headline should be an h1. */
  as?: BlurInTag;
}

const motionTags = {
  h1: motion.h1, h2: motion.h2, h3: motion.h3, h4: motion.h4, p: motion.p,
  span: motion.span, div: motion.div, li: motion.li, blockquote: motion.blockquote,
};

const BlurIn = ({ word, className, variant, duration = 1, as = "h1" }: BlurIntProps) => {
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;
  const Tag = motionTags[as];

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration }}
      variants={combinedVariants}
      className={cn(
        "font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem]",
        className,
      )}
    >
      {word}
    </Tag>
  );
};

export { BlurIn };

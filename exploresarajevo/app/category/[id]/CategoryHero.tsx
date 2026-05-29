"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Category } from "../../lib/types";
import {
  useLocalizedContent,
  useTranslation,
} from "../../lib/language-context";
import { isOpenNow, hasApplicableHours } from "../../lib/time";

interface Props {
  category: Category;
  premium: any[];
}

function PremiumPick({ item }: { item: any }) {
  const localized = useLocalizedContent(item)!;
  const wh = (item as any).workingHours || (item as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const { t } = useTranslation();

  const href =
    item.place_type === "attraction"
      ? `/attractions/${item.slug}`
      : `/${item.slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 hover:bg-white/15 transition"
    >
      <div
        className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden"
        style={{ background: "var(--bg-raised)" }}
      >
        <Image
          src={
            (localized.images &&
              Array.isArray(localized.images) &&
              localized.images[0]) ||
            "https://dummyimage.com/200x200/141420/a0a0b8"
          }
          alt={localized.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[#a78bfa] text-[9px] uppercase tracking-[0.25em] font-bold mb-1">
          <span className="w-1 h-1 rounded-full bg-[#a78bfa]" />
          Editor's pick
        </div>
        <h4 className="text-white text-base font-semibold truncate">
          {localized.name}
        </h4>
        {localized.address && (
          <div className="flex items-center gap-1 mt-0.5 text-white/60 text-xs">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{localized.address}</span>
          </div>
        )}
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-[#a78bfa] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition shrink-0 mr-1" />
    </Link>
  );
}

export default function CategoryHero({ category, premium }: Props) {
  const localizedCategory = useLocalizedContent(category)!;
  const [imageIndex, setImageIndex] = useState(0);

  // Build a small image carousel from premium picks
  const images = premium
    .map((p) => {
      const imgs = (p as any).images;
      return Array.isArray(imgs) ? imgs[0] : null;
    })
    .filter(Boolean) as string[];

  const heroImage =
    images[imageIndex] ||
    localizedCategory.coverImage ||
    "https://dummyimage.com/1920x1080/09090f/a0a0b8";

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={imageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroImage}
            alt={localizedCategory.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-8 md:pb-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Title */}
            <div className="lg:col-span-7">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-white/70 hover:text-[#a78bfa] text-xs uppercase tracking-[0.25em] font-bold mb-4 transition"
              >
                <span className="opacity-60">←</span> Back to Explore Sarajevo
              </Link>

              <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
                ◆ Department · Category
              </span>

              <h1 className="mt-4 text-white text-3xl md:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight">
                {localizedCategory.name}
              </h1>

              {(localizedCategory.text ||
                localizedCategory.description) && (
                <p className="mt-3 text-white/75 text-sm md:text-base max-w-xl leading-relaxed">
                  {localizedCategory.text || localizedCategory.description}
                </p>
              )}
            </div>

            {/* Premium picks card */}
            {premium.length > 0 && (
              <div className="lg:col-span-5 space-y-2">
                <div className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                  Top {Math.min(premium.length, 3)} in this department
                </div>
                {premium.slice(0, 3).map((p) => (
                  <PremiumPick
                    key={`${p.place_type ?? "biz"}-${p.id}`}
                    item={p}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

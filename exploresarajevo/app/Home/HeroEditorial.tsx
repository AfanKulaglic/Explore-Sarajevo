"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation, useLocalizedContent } from "../lib/language-context";
import { isOpenNow, hasApplicableHours } from "../lib/time";

interface PremiumItem {
  id: string | number;
  name: string;
  slug: string;
  place_type?: string;
  address?: string;
  images?: string[] | null;
  description?: string;
  working_hours?: string;
  name_en?: string;
  description_en?: string;
  address_en?: string;
}

interface Props { premium: PremiumItem[]; }

function hrefFor(item: PremiumItem) {
  return item.place_type === "attraction" ? `/attractions/${item.slug}` : `/${item.slug}`;
}

function imageFor(item: PremiumItem) {
  return (item.images && Array.isArray(item.images) && item.images[0]) || null;
}

// ─── Single card ────────────────────────────────────────────────────────────
function FeaturedCard({
  item,
  index,
  isActive,
  onClick,
}: {
  item: PremiumItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const localized = useLocalizedContent(item)!;
  const wh = item.working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const img = imageFor(localized as PremiumItem);

  return (
    <Link
      href={hrefFor(item)}
      onClick={onClick}
      className="relative flex-shrink-0 w-[38vw] md:w-[240px] rounded-2xl overflow-hidden cursor-pointer group block"
      style={{
        background: "rgba(15,15,26,0.75)",
        backdropFilter: "blur(16px)",
        border: isActive
          ? "1px solid rgba(124,58,237,0.8)"
          : "1px solid rgba(124,58,237,0.2)",
        boxShadow: isActive
          ? "0 0 28px rgba(124,58,237,0.3)"
          : "0 4px 24px rgba(0,0,0,0.4)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Image */}
      <div className="relative w-full h-32 md:h-40 overflow-hidden">
        <Image
          src={img!}
          alt={localized.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/70 via-transparent to-transparent" />

        {/* Status badge */}
        {showStatus && (
          <div
            className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
              open ? "bg-green-500/90 text-white" : "bg-black/70 text-white/70"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                open ? "bg-white animate-pulse" : "bg-white/50"
              }`}
            />
            {open ? "Open" : "Closed"}
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[#a78bfa] text-[9px] uppercase tracking-[0.25em] font-bold">
          <span className="w-1 h-1 rounded-full bg-[#a78bfa]" />
          {item.place_type === "attraction" ? "Attraction" : "Business"}
        </div>

        <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-[#a78bfa] transition-colors">
          {localized.name}
        </h3>

        {localized.address && (
          <div className="flex items-center gap-1 text-[#a0a0b8] text-[10px] md:text-xs mt-0.5">
            <MapPin className="w-2.5 h-2.5 shrink-0 text-[#7c3aed]" />
            <span className="truncate">{localized.address}</span>
          </div>
        )}
      </div>

      {/* Arrow indicator */}
      <div
        className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "var(--violet)" }}
      >
        <ArrowUpRight className="w-3 h-3 text-white" />
      </div>
    </Link>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export default function HeroEditorial({ premium }: Props) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  // Only show cards that actually have an image — no empty ghost cards
  const heroCards = premium
    .filter(p => imageFor(p) !== null)
    .slice(0, 8);

  // Collect background images — heroCards are already filtered to have images
  const bgImages = heroCards.map(p => imageFor(p) as string);

  const currentBg = bgImages[bgIndex] || "/assets/panoramaSarajevoDan.jpg";

  // Auto-rotate background every 4 s
  useEffect(() => {
    if (bgImages.length <= 1) return;
    const id = setInterval(() => {
      setBgIndex(i => (i + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [bgImages.length]);

  // Keep active card in sync with bg
  useEffect(() => {
    setActiveIndex(bgIndex);
    // Scroll the active card into view inside the rail
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[bgIndex] as HTMLElement | undefined;
    if (!card) return;
    const railLeft = rail.getBoundingClientRect().left;
    const cardLeft = card.getBoundingClientRect().left;
    const offset = cardLeft - railLeft - 16; // 16px padding
    rail.scrollBy({ left: offset, behavior: "smooth" });
  }, [bgIndex]);

  const handleCardClick = (i: number) => {
    setActiveIndex(i);
    setBgIndex(i);
  };

  const scrollRail = (dir: "left" | "right") => {
    railRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <section className="relative w-full" style={{ overflow: "hidden" }}>
      {/* ── Background crossfade ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={currentBg}
            alt="Sarajevo"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090f]/75 via-[#09090f]/45 to-[#09090f]/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090f]/65 via-transparent to-transparent" />

      {/* Violet glow */}
      <div
        className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />

      {/* ── Page content ── */}
      <div className="relative pt-20 md:pt-28 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-6 md:gap-12">

          {/* Headline + CTA */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 text-[#a0a0b8] text-[11px] uppercase tracking-[0.25em] font-semibold mb-6"
            >
              <span className="h-px w-10 bg-[#7c3aed]" />
              <span>
                Explore Sarajevo —{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white text-3xl md:text-6xl lg:text-8xl leading-[0.92] tracking-tight font-bold"
            >
              Discover
              <br />
              <span className="gradient-text">Sarajevo</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-5 text-[#a0a0b8] text-base md:text-lg max-w-lg leading-relaxed"
            >
              {t("hero.tagline")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link
                href="#editors-picks"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold tracking-wide text-white transition-all shadow-lg"
                style={{
                  background: "var(--violet)",
                  boxShadow: "0 0 30px rgba(124,58,237,0.4)",
                }}
              >
                Start exploring <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://sarayasolutions.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold tracking-wide text-white/80 hover:text-white transition"
                style={{
                  border: "1px solid rgba(124,58,237,0.35)",
                  background: "rgba(124,58,237,0.08)",
                }}
              >
                About Saraya Solutions
              </a>
            </motion.div>
          </div>

          {/* ── Featured carousel ── */}
          {heroCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 px-0">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#7c3aed]" />
                  <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
                    ◆ Featured places
                  </span>
                </div>

                {/* Prev / Next arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollRail("left")}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#a0a0b8] hover:text-white transition"
                    style={{
                      background: "rgba(15,15,26,0.7)",
                      border: "1px solid rgba(124,58,237,0.25)",
                    }}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail("right")}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#a0a0b8] hover:text-white transition"
                    style={{
                      background: "rgba(15,15,26,0.7)",
                      border: "1px solid rgba(124,58,237,0.25)",
                    }}
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scroll rail — breaks out of px-4 padding to go edge-to-edge */}
              <div className="relative -mx-4 md:mx-0">
                {/* Right fade edge — mobile only, hints more cards */}
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 md:hidden"
                  style={{ background: "linear-gradient(to left, rgba(9,9,15,0.9), transparent)" }}
                />

                <div
                  ref={railRef}
                  className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:px-0"
                >
                  {heroCards.map((item, i) => (
                    <div
                      key={`${item.place_type ?? "biz"}-${item.id}`}
                      className="snap-start"
                    >
                      <FeaturedCard
                        item={item}
                        index={i}
                        isActive={activeIndex === i}
                        onClick={() => handleCardClick(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5 mt-4">
                {heroCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleCardClick(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: activeIndex === i ? "20px" : "6px",
                      height: "6px",
                      background:
                        activeIndex === i
                          ? "var(--violet)"
                          : "rgba(124,58,237,0.3)",
                    }}
                    aria-label={`Go to item ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg-base))",
        }}
      />
    </section>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { isOpenNow, hasApplicableHours } from "../lib/time";
import { useLocalizedContent, useTranslation } from "../lib/language-context";

interface Highlight {
  id: string | number;
  name: string;
  slug: string;
  place_type?: string;
  description?: string;
  address?: string;
  images?: string[] | null;
  working_hours?: string;
  name_en?: string;
  description_en?: string;
  address_en?: string;
}

interface Props { items: Highlight[]; }

function HighlightCard({ item }: { item: Highlight }) {
  const localized = useLocalizedContent(item)!;
  const { t } = useTranslation();
  const wh = item.working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const href =
    item.place_type === "attraction"
      ? `/attractions/${item.slug}`
      : `/${item.slug}`;

  return (
    <Link
      href={href}
      className="group snap-start shrink-0 w-[42vw] md:w-[300px] zoom-on-hover"
    >
      <div
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <Image
          src={
            (localized.images &&
              Array.isArray(localized.images) &&
              localized.images[0]) ||
            "https://dummyimage.com/720x900/0f0f1a/ffffff"
          }
          alt={localized.name}
          fill
          sizes="340px"
          className="object-cover zoom-target opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/90 via-[#09090f]/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(to top, rgba(124,58,237,0.25) 0%, transparent 60%)",
          }}
        />

        {showStatus && (
          <div
            className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
              open
                ? "bg-green-500/90 text-white"
                : "bg-[#1e1e2e]/80 text-[#a0a0b8]"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                open ? "bg-white animate-pulse" : "bg-[#5a5a72]"
              }`}
            />
            {open ? t("status.open") : t("status.closed")}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-4 text-white">
          <h3 className="text-xl md:text-2xl font-bold leading-tight tracking-tight">
            {localized.name}
          </h3>
          {localized.address && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[#a0a0b8] text-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{localized.address}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HighlightsRail({ items }: Props) {
  const { t } = useTranslation();
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") =>
    railRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  if (items.length === 0) return null;

  return (
    <section
      className="relative py-10 md:py-20 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-8">
          <div>
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">
              ◆ Worth a visit
            </span>
            <h2 className="mt-3 text-xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
              {t("sections.highlights")}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full text-[#a0a0b8] hover:text-white transition flex items-center justify-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full text-[#a0a0b8] hover:text-white transition flex items-center justify-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-24 z-10"
          style={{
            background: "linear-gradient(to right, var(--bg-base), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 z-10"
          style={{
            background: "linear-gradient(to left, var(--bg-base), transparent)",
          }}
        />
        <div
          ref={railRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 md:px-8"
        >
          <div className="max-w-7xl mx-auto flex gap-4 md:gap-6">
            {items.map((item) => (
              <HighlightCard
                key={`${item.place_type ?? "biz"}-${item.id}`}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight } from "lucide-react";
import { AttractiveLocation } from "../../lib/types";
import {
  useLocalizedContent,
  useTranslation,
} from "../../lib/language-context";

interface Props {
  id: string;
  attractions: AttractiveLocation[];
}

function RelatedCard({ a }: { a: AttractiveLocation }) {
  const localized = useLocalizedContent(a)!;
  return (
    <Link
      href={`/attractions/${a.slug}`}
      className="group snap-start shrink-0 w-[42vw] md:w-[320px] zoom-on-hover"
    >
      <article
        className="rounded-2xl overflow-hidden hover:border-[#7c3aed] transition"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{ background: "var(--bg-raised)" }}
        >
          <Image
            src={
              localized.images?.[0] ||
              "https://dummyimage.com/720x540/0f0f1a/a0a0b8"
            }
            alt={localized.name}
            fill
            sizes="320px"
            className="object-cover zoom-target"
          />
          {localized.categories && localized.categories.length > 0 && (
            <span
              className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md text-white"
              style={{ background: "var(--bg-surface)" }}
            >
              {(localized.categories[0] as any).name}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-semibold text-white leading-tight line-clamp-2">
              {localized.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-[#5a5a72] group-hover:text-[#a78bfa] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition shrink-0 mt-0.5" />
          </div>
          {localized.address && (
            <div className="flex items-center gap-1.5 text-xs text-[#5a5a72]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{localized.address}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function RelatedAttractions({ id, attractions }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const normalizedId = decodeURIComponent(id);
  const current = attractions.find((a) => a.slug === normalizedId);
  if (!current) return null;

  const similar = attractions.filter(
    (a) => a.slug !== normalizedId && a.categoryId === current.categoryId
  );
  if (similar.length === 0) return null;

  const scroll = (dir: "left" | "right") =>
    railRef.current?.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });

  return (
    <section
      className="py-12 md:py-16"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
              ◆ Related
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl text-white font-semibold leading-tight">
              {t("attraction.similarLocations")}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full text-[#a0a0b8] hover:text-white transition flex items-center justify-center"
              style={{ border: "1px solid var(--border)" }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full text-[#a0a0b8] hover:text-white transition flex items-center justify-center"
              style={{ border: "1px solid var(--border)" }}
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
            background:
              "linear-gradient(to right, var(--bg-surface), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 z-10"
          style={{
            background:
              "linear-gradient(to left, var(--bg-surface), transparent)",
          }}
        />
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 md:px-8"
        >
          <div className="max-w-7xl mx-auto flex gap-4">
            {similar.slice(0, 12).map((a) => (
              <RelatedCard key={String(a.id)} a={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

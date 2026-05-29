"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { isOpenNow, hasApplicableHours } from "../lib/time";
import { useLocalizedContent, useTranslation } from "../lib/language-context";

// Generic item shape — works for both businesses and attractions
export interface GridItem {
  id: string | number;
  name: string;
  slug: string;
  place_type?: string;          // "attraction" | undefined
  categoryId?: string;
  images?: string[] | null;
  address?: string;
  workingHours?: string;
  working_hours?: string;
  // localization
  name_en?: string;
  description_en?: string;
  address_en?: string;
  // categories array (attractions)
  categories?: { id?: any; name: string; name_en?: string }[];
}

function hrefFor(item: GridItem) {
  return item.place_type === "attraction"
    ? `/attractions/${item.slug}`
    : `/${item.slug}`;
}

function imageFor(item: GridItem) {
  return (
    (item.images && Array.isArray(item.images) && item.images[0]) ||
    "https://dummyimage.com/1200x600/0f0f1a/ffffff"
  );
}

function categoryLabel(item: GridItem) {
  if (item.categoryId) return item.categoryId;
  if (item.categories && item.categories.length > 0) return item.categories[0].name;
  return null;
}

// ─── Wide card ────────────────────────────────────────────────────────────────
function WideCard({ item }: { item: GridItem }) {
  const localized = useLocalizedContent(item)!;
  const { t } = useTranslation();
  const wh = (item as any).workingHours || (item as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const cat = categoryLabel(localized as GridItem);

  return (
    <Link href={hrefFor(item)} className="group block zoom-on-hover h-full">
      {/* No separate text block — everything overlaid on the image */}
      <article
        className="relative overflow-hidden rounded-2xl h-full"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="relative w-full h-full min-h-[220px] overflow-hidden">
          <Image
            src={imageFor(localized as GridItem)}
            alt={localized.name}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover zoom-target opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          {/* Strong bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/90 via-[#09090f]/30 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(to top, rgba(124,58,237,0.3) 0%, transparent 55%)" }}
          />

          {/* Status — top left */}
          {showStatus && (
            <div
              className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                open ? "bg-green-500/90 text-white" : "bg-[#1e1e2e]/80 text-[#a0a0b8]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-white animate-pulse" : "bg-[#5a5a72]"}`} />
              {open ? t("status.open") : t("status.closed")}
            </div>
          )}

          {/* Arrow — top right */}
          <div
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: "var(--violet)" }}
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>

          {/* Text overlaid at bottom */}
          <div className="absolute bottom-0 inset-x-0 p-5">
            {cat && (
              <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.25em] font-bold">
                {cat}
              </span>
            )}
            <h3 className="mt-1 text-white text-xl md:text-2xl font-bold leading-tight group-hover:text-[#a78bfa] transition-colors">
              {localized.name}
            </h3>
            {localized.address && (
              <div className="mt-1.5 flex items-center gap-1.5 text-white/70 text-xs">
                <MapPin className="w-3 h-3 shrink-0 text-[#a78bfa]" />
                <span className="truncate">{localized.address}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Compact card ─────────────────────────────────────────────────────────────
function CompactCard({ item }: { item: GridItem }) {
  const localized = useLocalizedContent(item)!;
  const { t } = useTranslation();
  const wh = (item as any).workingHours || (item as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const cat = categoryLabel(localized as GridItem);

  return (
    <Link href={hrefFor(item)} className="group block zoom-on-hover flex-1 min-h-0">
      {/* Full-bleed image with text overlay — same pattern as wide card */}
      <article
        className="relative overflow-hidden rounded-2xl h-full"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="relative w-full h-full min-h-[120px] overflow-hidden">
          <Image
            src={imageFor(localized as GridItem)}
            alt={localized.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover zoom-target opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          {/* Strong gradient so text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/95 via-[#09090f]/40 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(to top, rgba(124,58,237,0.3) 0%, transparent 55%)" }}
          />

          {/* Status — top left */}
          {showStatus && (
            <div
              className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                open ? "bg-green-500/90 text-white" : "bg-[#1e1e2e]/80 text-[#a0a0b8]"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${open ? "bg-white animate-pulse" : "bg-[#5a5a72]"}`} />
              {open ? t("status.open") : t("status.closed")}
            </div>
          )}

          {/* Arrow — top right */}
          <div
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: "var(--violet)" }}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Text overlaid at bottom */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            {cat && (
              <span className="text-[#a78bfa] text-[9px] uppercase tracking-[0.25em] font-bold">
                {cat}
              </span>
            )}
            <h3 className="mt-0.5 text-white text-sm font-bold leading-tight line-clamp-1 group-hover:text-[#a78bfa] transition-colors">
              {localized.name}
            </h3>
            {localized.address && (
              <div className="mt-1 flex items-center gap-1 text-white/60 text-[10px]">
                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#a78bfa]" />
                <span className="truncate">{localized.address}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function ListRow({ item }: { item: GridItem }) {
  const localized = useLocalizedContent(item)!;
  const { t } = useTranslation();
  const wh = (item as any).workingHours || (item as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;
  const cat = categoryLabel(localized as GridItem);

  return (
    <Link
      href={hrefFor(item)}
      className="group flex items-center gap-4 p-3 rounded-xl transition-all"
      style={{ border: "1px solid var(--border)", background: "var(--bg-raised)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div
        className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden"
        style={{ background: "var(--bg-muted)" }}
      >
        <Image
          src={imageFor(localized as GridItem)}
          alt={localized.name}
          fill
          sizes="56px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-white text-sm font-semibold truncate group-hover:text-[#a78bfa] transition-colors">
          {localized.name}
        </h4>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-[#5a5a72]">
          {cat && <span className="truncate">{cat}</span>}
          {showStatus && (
            <span className={open ? "text-green-400" : "text-[#5a5a72]"}>
              {open ? t("status.open") : t("status.closed")}
            </span>
          )}
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-[#5a5a72] group-hover:text-[#a78bfa] transition shrink-0" />
    </Link>
  );
}

// ─── Shared grid layout ───────────────────────────────────────────────────────
interface FeaturedGridProps {
  items: GridItem[];
  eyebrow: string;
  title: string;
  subtitle?: string;
  background?: string;
}

export default function FeaturedGrid({
  items,
  eyebrow,
  title,
  subtitle,
  background = "var(--bg-base)",
}: FeaturedGridProps) {
  if (!items || items.length === 0) return null;

  const wide = items[0];
  const compact = items.slice(1, 4);   // 3 compact cards on the right
  const listItems = items.slice(4, 10);

  return (
    <section
      className="relative py-10 md:py-20 px-4 md:px-8"
      style={{ background, borderTop: "1px solid var(--border)", overflow: "hidden" }}
    >
      <div
        className="absolute bottom-0 right-1/3 w-[500px] h-[300px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-10">
          <div>
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-2xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-[#a0a0b8] max-w-md text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        {/* Wide + 3 compact — left fills height of right column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:items-stretch">
          <div className="md:col-span-2 md:h-[420px]">
            <WideCard item={wide} />
          </div>
          {compact.length > 0 && (
            <div className="flex flex-col gap-4 md:gap-5 md:h-[420px]">
              {compact.map(item => (
                <CompactCard key={`${item.place_type ?? "biz"}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* List rows */}
        {listItems.length > 0 && (
          <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {listItems.map(item => (
              <ListRow key={`${item.place_type ?? "biz"}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, ArrowUpRight } from "lucide-react";
import { Category } from "../../lib/types";
import { isOpenNow, hasApplicableHours } from "../../lib/time";
import { useLocalizedContent, useTranslation } from "../../lib/language-context";

interface Props {
  items: any[];
  category: Category;
}

function DirectoryCard({ item }: { item: any }) {
  const localized = useLocalizedContent(item)!;
  const { t } = useTranslation();
  const wh = item.workingHours || item.working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;

  const href =
    item.place_type === "attraction"
      ? `/attractions/${item.slug}`
      : `/${item.slug}`;

  return (
    <Link href={href} className="group block">
      <article
        className="rounded-2xl overflow-hidden hover:border-[#7c3aed] hover:shadow-md transition-all duration-300"
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
              (localized.images &&
                Array.isArray(localized.images) &&
                localized.images[0]) ||
              "https://dummyimage.com/720x540/141420/a0a0b8"
            }
            alt={localized.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div
            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md text-white"
            style={{ background: "var(--bg-surface)" }}
          >
            {item.place_type === "attraction" ? "Attraction" : "Business"}
          </div>

          {showStatus && (
            <div
              className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                open
                  ? "bg-green-500/90 text-white"
                  : "bg-black/70 text-white/85"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  open ? "bg-white animate-pulse" : "bg-white/60"
                }`}
              />
              {open ? t("status.open") : t("status.closed")}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
              {localized.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-[#5a5a72] group-hover:text-[#a78bfa] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
          </div>

          {localized.types && localized.types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {localized.types.slice(0, 2).map((tp: any) => (
                <span
                  key={tp.id ?? tp.name}
                  className="text-[10px] uppercase tracking-wider font-bold text-[#a78bfa] px-2 py-0.5 rounded-full"
                  style={{ background: "var(--bg-raised)" }}
                >
                  {tp.name}
                </span>
              ))}
            </div>
          )}

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

export default function CategoryDirectory({ items, category }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [visible, setVisible] = useState(12);

  // Filter items in this category
  const inCategory = useMemo(() => {
    const seen = new Set<string>();
    return items
      .filter((b: any) =>
        b.categories?.some((c: any) => c.id === category.id)
      )
      .filter((b: any) => {
        const k =
          b.place_type === "attraction"
            ? `attraction-${b.id}`
            : `business-${b.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
  }, [items, category.id]);

  const types = useMemo(() => {
    const set = new Set<string>();
    inCategory.forEach((b: any) =>
      b.types?.forEach((t: any) => t?.name && set.add(t.name))
    );
    return Array.from(set).sort();
  }, [inCategory]);

  const filtered = useMemo(() => {
    let list = [...inCategory];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b: any) =>
          b.name?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
      );
    }
    if (selectedType) {
      list = list.filter((b: any) =>
        b.types?.some((t: any) => t.name === selectedType)
      );
    }
    return list;
  }, [inCategory, query, selectedType]);

  return (
    <section
      className="relative py-10 md:py-20 px-4 md:px-8"
      style={{
        background: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
              ◆ The full list
            </span>
            <h2 className="mt-3 text-xl md:text-3xl text-white font-semibold tracking-tight leading-[1.05]">
              {t("business.allLocations")}
            </h2>
          </div>
          <p className="text-[#5a5a72] text-sm md:text-base max-w-md">
            {filtered.length} {filtered.length === 1 ? "place" : "places"} in{" "}
            <span className="text-[#a0a0b8] font-medium">{category.name}</span>.
          </p>
        </div>

        {/* Toolbar */}
        <div
          className="rounded-2xl p-3 md:p-4 mb-6 flex flex-col md:flex-row gap-3"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a72]" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(12);
              }}
              placeholder={t("common.search") + "..."}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-transparent focus:border-[#7c3aed] focus:outline-none text-sm text-[#a0a0b8] placeholder:text-[#5a5a72]"
              style={{ background: "var(--bg-raised)" }}
            />
          </div>
        </div>

        {/* Type chips */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Chip
              active={!selectedType}
              onClick={() => {
                setSelectedType(null);
                setVisible(12);
              }}
            >
              {t("common.all")}
            </Chip>
            {types.map((type) => (
              <Chip
                key={type}
                active={selectedType === type}
                onClick={() => {
                  setSelectedType(selectedType === type ? null : type);
                  setVisible(12);
                }}
              >
                {type}
              </Chip>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.slice(0, visible).map((b: any) => {
            const k =
              b.place_type === "attraction"
                ? `attraction-${b.id}`
                : `business-${b.id}`;
            return <DirectoryCard key={k} item={b} />;
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#5a5a72] italic">
            {t("sections.noBusinessesFound")}
          </div>
        )}

        {filtered.length > visible && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisible((v) => v + 12)}
              className="px-6 py-3 rounded-full text-white text-sm font-semibold transition"
              style={{ background: "var(--violet)" }}
            >
              Load more · {filtered.length - visible} remaining
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
        active
          ? "text-white"
          : "text-[#a0a0b8] hover:border-[#7c3aed] hover:text-[#a78bfa]"
      }`}
      style={
        active
          ? { background: "var(--violet)" }
          : {
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }
      }
    >
      {children}
    </button>
  );
}

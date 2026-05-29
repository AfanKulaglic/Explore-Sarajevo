"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useLocalizedContent } from "../lib/language-context";

interface Item {
  id: string | number; name: string; slug: string; place_type?: string;
  description?: string; address?: string; images?: string[] | null;
  name_en?: string; description_en?: string; address_en?: string;
}
interface Props { items: Item[]; }

function hrefFor(item: Item) {
  return item.place_type === "attraction" ? `/attractions/${item.slug}` : `/${item.slug}`;
}
function imageFor(item: Item) {
  return (item.images && Array.isArray(item.images) && item.images[0]) || "https://dummyimage.com/1200x900/0f0f1a/ffffff";
}

function PickCard({ item, index, size = "small" }: { item: Item; index: number; size?: "lead" | "medium" | "small" }) {
  const localized = useLocalizedContent(item)!;
  const heightClass = size === "lead" ? "h-[520px] md:h-[640px]" : size === "medium" ? "h-[300px] md:h-[310px]" : "h-[260px] md:h-[280px]";
  const titleClass  = size === "lead" ? "text-3xl md:text-5xl" : size === "medium" ? "text-xl md:text-2xl" : "text-lg md:text-xl";

  return (
    <Link href={hrefFor(item)} className="group block zoom-on-hover">
      <article className={`relative ${heightClass} rounded-3xl overflow-hidden`} style={{ background: 'var(--bg-surface)' }}>
        <Image src={imageFor(localized as Item)} alt={localized.name} fill
          sizes={size === "lead" ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
          className="object-cover zoom-target opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/90 via-[#09090f]/20 to-transparent" />

        {/* Number badge */}
        {/* Arrow */}
        <div
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}
        >
          <ArrowUpRight className="w-4 h-4 text-[#a78bfa]" />
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 text-white">
          <h3 className={`${titleClass} font-bold leading-[1.05] tracking-tight mb-2`}>{localized.name}</h3>
          {size === "lead" && localized.description && (
            <p className="text-[#a0a0b8] text-sm md:text-base max-w-md line-clamp-2 mb-3"
              dangerouslySetInnerHTML={{ __html: String(localized.description).replace(/<[^>]+>/g, "").slice(0, 160) + "…" }}
            />
          )}
          {localized.address && (
            <div className="flex items-center gap-1.5 text-[#a0a0b8] text-xs">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{localized.address}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function EditorsPicks({ items }: Props) {
  const picks = items.slice(0, 5);
  if (picks.length === 0) return null;
  const lead = picks[0];
  const rest = picks.slice(1);

  return (
    <section id="editors-picks" className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Violet glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ The Selection</span>
          </div>
          <h2 className="text-4xl md:text-6xl text-white font-bold tracking-tight leading-[1.05] max-w-3xl">
            Editor's picks
          </h2>
          <p className="mt-4 text-[#a0a0b8] max-w-2xl text-base md:text-lg">
            Hand-picked premium experiences — the places we'd send a friend to first.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <PickCard item={lead} index={0} size="lead" />
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
              {rest.map((item, i) => (
                <PickCard key={`${item.place_type ?? "biz"}-${item.id}`} item={item} index={i + 1} size="medium" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

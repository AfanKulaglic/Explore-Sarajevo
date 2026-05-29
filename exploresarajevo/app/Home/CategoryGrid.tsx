"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Category } from "../lib/types";
import { useLocalizedContent, useTranslation } from "../lib/language-context";
import { CategoryIcon } from "../lib/category-icons";

interface Props { categories: Category[]; }

// ─── Lead card (large, left column) ─────────────────────────────────────────
function LeadCard({ category, index }: { category: Category; index: number }) {
  const localized = useLocalizedContent(category)!;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block overflow-hidden rounded-3xl zoom-on-hover"
      style={{ background: 'var(--bg-surface)', border: '1px solid rgba(124,58,237,0.15)' }}
    >
      <div className="relative w-full h-[280px] md:h-full md:min-h-[480px]">
        {localized.coverImage ? (
          <Image
            src={localized.coverImage}
            alt={localized.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover zoom-target opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #141420 0%, #1e1e2e 100%)' }} />
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/90 via-[#09090f]/20 to-transparent" />
        {/* Violet hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to top, rgba(124,58,237,0.35) 0%, transparent 55%)' }} />

        {/* Arrow */}
        <div
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
          style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowUpRight className="w-5 h-5 text-[#a78bfa]" />
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-white">
          <div className="mb-3 text-[#a78bfa] [&>svg]:w-7 [&>svg]:h-7">
            {localized.icon
              ? <Image src={localized.icon} alt="" width={28} height={28} className="opacity-90" />
              : <CategoryIcon slug={category.slug} />
            }
          </div>
          <h3 className="text-xl md:text-3xl font-bold leading-tight tracking-tight">{localized.name}</h3>
          {localized.description && (
            <p className="mt-2 text-[#a0a0b8] text-sm md:text-base line-clamp-2 max-w-sm">
              {String(localized.description).slice(0, 120)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Small card (right grid) ─────────────────────────────────────────────────
function SmallCard({ category, index }: { category: Category; index: number }) {
  const localized = useLocalizedContent(category)!;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl zoom-on-hover"
      style={{ background: 'var(--bg-surface)', border: '1px solid rgba(124,58,237,0.12)' }}
    >
      <div className="relative w-full h-[160px] md:h-[220px]">
        {localized.coverImage ? (
          <Image
            src={localized.coverImage}
            alt={localized.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover zoom-target opacity-75 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #141420 0%, #1e1e2e 100%)' }} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/85 via-[#09090f]/15 to-transparent" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to top, rgba(124,58,237,0.3) 0%, transparent 55%)' }} />

        {/* Arrow */}
        <div
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
          style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowUpRight className="w-4 h-4 text-[#a78bfa]" />
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 p-4 text-white">
          <div className="mb-1.5 text-[#a78bfa] [&>svg]:w-5 [&>svg]:h-5">
            {localized.icon
              ? <Image src={localized.icon} alt="" width={20} height={20} className="opacity-90" />
              : <CategoryIcon slug={category.slug} />
            }
          </div>
          <h3 className="text-base md:text-xl font-bold leading-tight tracking-tight">{localized.name}</h3>
          {localized.description && (
            <p className="mt-0.5 text-[#a0a0b8] text-xs line-clamp-1">
              {String(localized.description).slice(0, 60)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function CategoryGrid({ categories }: Props) {
  const { t } = useTranslation();
  if (!categories || categories.length === 0) return null;

  // First category = lead card; rest fill the right grid
  const lead = categories[0];
  const rest = categories.slice(1);

  // Group rest into rows of 2 for the right column
  // We show up to 4 in the first block (2×2), then any overflow in a full-width row below
  const rightBlock = rest.slice(0, 4);
  const overflow = rest.slice(4);

  return (
    <section
      className="relative py-10 md:py-20 px-4 md:px-8"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}
    >
      {/* Subtle violet glow */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-10">
          <div>
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Departments</span>
            <h2 className="mt-3 text-2xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
              Browse by <span className="gradient-text">category</span>
            </h2>
          </div>
          <p className="text-[#a0a0b8] max-w-md text-sm md:text-base">
            From food and stays to wellness and culture — pick a thread and follow it across the city.
          </p>
        </div>

        {/* Main grid: lead (left) + 2×2 small (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Lead */}
          {lead && <LeadCard category={lead} index={0} />}

          {/* Right: 2×2 grid */}
          {rightBlock.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {rightBlock.map((cat, i) => (
                <SmallCard key={`${cat.id}-${i}`} category={cat} index={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Overflow row — any categories beyond the first 5 */}
        {overflow.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mt-4 md:mt-5">
            {overflow.map((cat, i) => (
              <SmallCard key={`${cat.id}-overflow-${i}`} category={cat} index={i + 5} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

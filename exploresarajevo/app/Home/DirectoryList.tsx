"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, ArrowUpRight, ListFilter, ChevronDown, Check } from "lucide-react";
import { Business } from "../lib/types";
import { isOpenNow, hasApplicableHours } from "../lib/time";
import { useLocalizedContent, useTranslation } from "../lib/language-context";

interface Props { businesses: Business[]; }

function DirectoryRow({ b }: { b: Business }) {
  const localized = useLocalizedContent(b)!;
  const { t } = useTranslation();
  const wh = (b as any).workingHours || (b as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;

  return (
    <Link href={`/${b.slug}`} className="group flex items-center gap-4 p-3 md:p-4 rounded-xl transition-all"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-lg overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
        <Image
          src={(localized.images && Array.isArray(localized.images) && localized.images[0]) || "https://dummyimage.com/200x200/141420/ffffff"}
          alt={localized.name} fill sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-white truncate">{localized.name}</h3>
          {showStatus && (
            <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${open ? "text-green-400" : "text-[#5a5a72]"}`}
              style={{ background: open ? 'rgba(16,185,129,0.1)' : 'var(--bg-raised)' }}>
              <span className={`w-1 h-1 rounded-full ${open ? "bg-green-400" : "bg-[#5a5a72]"}`} />
              {open ? t("status.open") : t("status.closed")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#5a5a72]">
          {localized.categoryId && <span className="truncate">{localized.categoryId}</span>}
          {localized.address && (
            <span className="hidden sm:flex items-center gap-1 truncate min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{localized.address}</span>
            </span>
          )}
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-[#5a5a72] group-hover:text-[#a78bfa] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition shrink-0" />
    </Link>
  );
}

export default function DirectoryList({ businesses }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const catRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach(b => { if (b.categoryId) set.add(b.categoryId); });
    return Array.from(set).sort();
  }, [businesses]);

  const filtered = useMemo(() => {
    let list = [...businesses];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(b => b.name?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q) || b.categoryId?.toLowerCase().includes(q));
    }
    if (activeCat) list = list.filter(b => b.categoryId === activeCat);
    if (letter) list = list.filter(b => b.name?.toUpperCase().startsWith(letter));
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [businesses, query, letter, activeCat]);

  const letters = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach(b => { const ch = b.name?.[0]?.toUpperCase(); if (ch && /[A-ZČĆŠŽĐ]/.test(ch)) set.add(ch); });
    return Array.from(set).sort();
  }, [businesses]);

  return (
    <section className="relative py-10 md:py-20 px-4 md:px-8" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ The Directory</span>
            <h2 className="mt-3 text-2xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
              {t("sections.allBusinesses")}
            </h2>
          </div>
          <p className="text-[#a0a0b8] max-w-md text-sm md:text-base">Every place we know about — searchable, ready to explore.</p>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl p-3 md:p-4 mb-6 flex flex-col md:flex-row gap-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a72]" />
            <input type="text" value={query}
              onChange={e => { setQuery(e.target.value); setVisibleCount(24); }}
              placeholder={t("common.search") + "..."}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm text-white placeholder:text-[#5a5a72] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            />
          </div>
          {/* Custom category dropdown */}
          <div ref={catRef} className="relative md:w-56">
            <button
              type="button"
              onClick={() => setCatOpen(o => !o)}
              className="w-full flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-lg text-sm text-left transition-all focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              style={{ background: 'var(--bg-raised)', border: `1px solid ${catOpen ? 'rgba(124,58,237,0.6)' : 'var(--border)'}` }}
            >
              <ListFilter className="w-4 h-4 text-[#5a5a72] shrink-0" />
              <span className="flex-1 truncate text-white">
                {activeCat || t("common.all")}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#5a5a72] shrink-0 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {catOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 shadow-2xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid rgba(124,58,237,0.25)', maxHeight: '240px', overflowY: 'auto' }}
              >
                {/* All option */}
                <button
                  type="button"
                  onClick={() => { setActiveCat(null); setVisibleCount(24); setCatOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left"
                  style={{ color: !activeCat ? 'white' : 'var(--text-secondary)', background: !activeCat ? 'rgba(124,58,237,0.15)' : 'transparent' }}
                  onMouseEnter={e => { if (activeCat) e.currentTarget.style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { if (activeCat) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{t("common.all")}</span>
                  {!activeCat && <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />}
                </button>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border)', margin: '0 8px' }} />

                {/* Category options */}
                {categories.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setActiveCat(c); setVisibleCount(24); setCatOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left"
                    style={{ color: activeCat === c ? 'white' : 'var(--text-secondary)', background: activeCat === c ? 'rgba(124,58,237,0.15)' : 'transparent' }}
                    onMouseEnter={e => { if (activeCat !== c) e.currentTarget.style.background = 'var(--bg-raised)'; }}
                    onMouseLeave={e => { if (activeCat !== c) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="truncate">{c}</span>
                    {activeCat === c && <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* A-Z bar */}
        {letters.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-6">
            <Chip active={!letter} onClick={() => { setLetter(null); setVisibleCount(24); }}>{t("common.all")}</Chip>
            {letters.map(l => (
              <Chip key={l} active={letter === l} onClick={() => { setLetter(l === letter ? null : l); setVisibleCount(24); }}>
                {l}
              </Chip>
            ))}
          </div>
        )}

        <div className="text-xs text-[#5a5a72] mb-3 uppercase tracking-wider font-semibold">
          {filtered.length} {filtered.length === 1 ? "place" : "places"}
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {filtered.slice(0, visibleCount).map(b => <DirectoryRow key={String(b.id)} b={b} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#5a5a72] italic">{t("sections.noBusinessesFound")}</div>
        )}

        {filtered.length > visibleCount && (
          <div className="flex justify-center mt-8">
            <button onClick={() => setVisibleCount(v => v + 24)}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white transition"
              style={{ background: 'var(--violet)' }}>
              Load more · {filtered.length - visibleCount} remaining
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-semibold transition"
      style={active
        ? { background: 'var(--violet)', color: 'white', border: '1px solid var(--violet)' }
        : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
      }>
      {children}
    </button>
  );
}

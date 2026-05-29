"use client";

import { Map, Marker, Overlay } from "pigeon-maps";
import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Business } from "../lib/types";
import { MapPin, X, Phone, Globe, Plus, Minus, ArrowUpRight } from "lucide-react";
import { useTranslation } from "../lib/language-context";

export default function MapExplore({ businesses }: { businesses: Business[] }) {
  const { t } = useTranslation();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<Business | null>(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([43.8563, 18.4131]);
  const [mapHeight, setMapHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(businesses.map(b => b.categoryId).filter((c): c is string => Boolean(c))));
  const filtered = useMemo(() => activeCat ? businesses.filter(b => b.categoryId === activeCat) : businesses, [activeCat, businesses]);

  // Measure actual container height for pigeon-maps
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setMapHeight(containerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (filtered.length === 0) { setCenter([43.8563, 18.4131]); setZoom(13); return; }
    const w = filtered.filter(b => b.location);
    if (w.length === 0) return;
    const lats = w.map(b => Number(b.location!.split(",")[0]));
    const lngs = w.map(b => Number(b.location!.split(",")[1]));
    setCenter([(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2]);
    const diff = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    setZoom(diff < 0.01 ? 15 : diff < 0.05 ? 13 : diff < 0.1 ? 12 : 11);
  }, [filtered]);

  return (
    <section className="relative py-10 md:py-20 px-4 md:px-8 overflow-hidden" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-5 md:mb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ The Cartograph</span>
              <h2 className="mt-2 text-2xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
                {t("sections.exploreOnMap")}
              </h2>
              <p className="mt-1.5 text-[#a0a0b8] text-xs md:text-base max-w-md">{t("sections.findLocations")}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 mt-1">
              <div className="text-center">
                <p className="text-xl md:text-3xl text-[#a78bfa] font-bold tabular-nums leading-none">{filtered.filter(b => b.location).length}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#5a5a72] font-semibold mt-0.5">Pinned</p>
              </div>
              <div className="w-px h-8 bg-[#1e1e2e]" />
              <div className="text-center">
                <p className="text-xl md:text-3xl text-[#a78bfa] font-bold tabular-nums leading-none">{categories.length}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#5a5a72] font-semibold mt-0.5">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1 md:flex-wrap md:overflow-visible">
          <FilterChip active={!activeCat} onClick={() => setActiveCat(null)}>{t("common.all")}</FilterChip>
          {categories.map(c => <FilterChip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>{c}</FilterChip>)}
        </div>

        {/* Map container — ref measures actual height for pigeon-maps */}
        <div
          ref={containerRef}
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ height: '50vh', minHeight: '360px', border: '1px solid var(--border)' }}
        >
          <Map
            height={mapHeight}
            center={center}
            zoom={zoom}
            mouseEvents={true}
            touchEvents={true}
            onBoundsChanged={({ center: c, zoom: z }) => { setCenter(c); setZoom(z); }}
          >
            {filtered.filter(b => b.location).map(b => {
              const [lat, lng] = b.location!.split(",").map(Number);
              return <Marker key={b.id} anchor={[lat, lng]} onClick={() => setSelected(b)} color="#7c3aed" />;
            })}
            {selected && selected.location && (
              <Overlay anchor={selected.location.split(",").map(Number) as [number, number]} offset={[150, 200]}>
                <PopoverCard business={selected} onClose={() => setSelected(null)} />
              </Overlay>
            )}
          </Map>

          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
            <button onClick={() => setZoom(z => Math.min(z + 1, 18))}
              className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center transition text-white"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 1, 1))}
              className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center transition text-white"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition shrink-0 whitespace-nowrap"
      style={active
        ? { background: 'var(--violet)', color: 'white', border: '1px solid var(--violet)' }
        : { background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
      }>
      {children}
    </button>
  );
}

function PopoverCard({ business, onClose }: { business: Business; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 rounded-2xl shadow-2xl w-[280px] relative"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <button onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-full text-[#5a5a72] hover:text-white transition"
        style={{ background: 'var(--bg-raised)' }}>
        <X className="w-4 h-4" />
      </button>
      {business.images && Array.isArray(business.images) && business.images[0] && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3" style={{ background: 'var(--bg-raised)' }}>
          <Image src={business.images[0]} alt={business.name} fill sizes="280px" className="object-cover" />
        </div>
      )}
      <h3 className="font-bold text-white text-lg leading-tight pr-6 mb-2">{business.name}</h3>
      {business.description && (
        <p className="text-[#a0a0b8] text-xs mb-3 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: String(business.description).replace(/<[^>]+>/g, "") }} />
      )}
      <div className="space-y-1.5 mb-3">
        {business.address && (
          <div className="flex items-start gap-2 text-[#a0a0b8] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#7c3aed] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{business.address}</span>
          </div>
        )}
        {business.phone && (
          <div className="flex items-center gap-2 text-[#a0a0b8] text-xs">
            <Phone className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
            <span>{business.phone}</span>
          </div>
        )}
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#a78bfa] text-xs font-medium hover:text-[#c4b5fd] transition">
            <Globe className="w-3.5 h-3.5 shrink-0" />{t("sections.visitWebsite")}
          </a>
        )}
      </div>
      <Link href={`/${business.slug}`}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold text-white transition"
        style={{ background: 'var(--violet)' }}>
        Open profile <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

"use client";

import { Map, Marker, Overlay } from "pigeon-maps";
import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, X, MapPin, ArrowUpRight } from "lucide-react";
import { Business, Category } from "../../lib/types";
import { useTranslation } from "../../lib/language-context";

interface Props {
  businesses: Business[];
  attractions: any[];
  category: Category;
}

export default function CategoryMap({
  businesses,
  attractions,
  category,
}: Props) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([43.8563, 18.4131]);
  const [selected, setSelected] = useState<any>(null);
  const [mapHeight, setMapHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setMapHeight(containerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const filteredBiz = useMemo(
    () =>
      businesses.filter((b) =>
        b.categories?.some((c: any) => c.id === category.id)
      ),
    [businesses, category.id]
  );
  const filteredAttr = useMemo(
    () =>
      (attractions || [])
        .filter((a: any) =>
          a.categories?.some((c: any) => c.id === category.id)
        )
        .map((a: any) => ({ ...a, place_type: "attraction" })),
    [attractions, category.id]
  );

  const all = useMemo(
    () => [...filteredBiz, ...filteredAttr],
    [filteredBiz, filteredAttr]
  );

  useEffect(() => {
    const withCoords = all.filter((b: any) => b.location);
    if (withCoords.length === 0) return;
    const lats = withCoords.map((b: any) => Number(b.location!.split(",")[0]));
    const lngs = withCoords.map((b: any) => Number(b.location!.split(",")[1]));
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    setCenter([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
    const diff = Math.max(maxLat - minLat, maxLng - minLng);
    if (diff < 0.01) setZoom(15);
    else if (diff < 0.05) setZoom(13);
    else if (diff < 0.1) setZoom(12);
    else setZoom(11);
  }, [all]);

  if (all.length === 0) return null;

  return (
    <section className="relative py-12 md:py-16 px-4 md:px-8 text-white" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <span className="text-amber-300 text-[10px] uppercase tracking-[0.3em] font-bold">
              ◆ On the map
            </span>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold leading-tight">
              Where to find them
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <Legend color="#b45309" label={`${filteredBiz.length} businesses`} />
            <Legend color="#0f766e" label={`${filteredAttr.length} attractions`} />
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[55vh] min-h-[400px] rounded-2xl overflow-hidden border border-white/10"
        >
          <Map
            height={mapHeight}
            center={center}
            zoom={zoom}
            mouseEvents={true}
            touchEvents={true}
            onBoundsChanged={({ center: c, zoom: z }) => {
              setCenter(c);
              setZoom(z);
            }}
          >
            {all
              .filter((b: any) => b.location)
              .map((b: any) => {
                const [lat, lng] = b.location!.split(",").map(Number);
                const k =
                  b.place_type === "attraction"
                    ? `a-${b.id}`
                    : `b-${b.id}`;
                return (
                  <Marker
                    key={k}
                    anchor={[lat, lng]}
                    color={
                      b.place_type === "attraction" ? "#0f766e" : "#b45309"
                    }
                    onClick={() => setSelected(b)}
                  />
                );
              })}

            {selected && selected.location && (
              <Overlay
                anchor={
                  selected.location
                    .split(",")
                    .map(Number) as [number, number]
                }
                offset={[140, 200]}
              >
                <div className="p-3 rounded-2xl shadow-2xl w-[260px] relative"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-2 right-2 p-1 rounded-full text-[#5a5a72] hover:text-white transition"
                    style={{ background: 'var(--bg-raised)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {selected.images?.[0] && (
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2" style={{ background: 'var(--bg-raised)' }}>
                      <Image
                        src={selected.images[0]}
                        alt={selected.name}
                        fill
                        sizes="260px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <h3 className="font-semibold text-white text-sm leading-tight pr-5 mb-1">
                    {selected.name}
                  </h3>

                  {selected.address && (
                    <div className="flex items-start gap-1.5 text-[#a0a0b8] text-xs mb-2">
                      <MapPin className="w-3 h-3 text-[#7c3aed] shrink-0 mt-0.5" />
                      <span>{selected.address}</span>
                    </div>
                  )}

                  <Link
                    href={
                      selected.place_type === "attraction"
                        ? `/attractions/${selected.slug}`
                        : `/${selected.slug}`
                    }
                    className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-white text-xs font-semibold transition"
                    style={{ background: 'var(--violet)' }}
                  >
                    Open profile
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </Overlay>
            )}
          </Map>

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => setZoom((z) => Math.min(z + 1, 18))}
              className="bg-white w-9 h-9 rounded-lg shadow-md hover:bg-stone-100 transition flex items-center justify-center"
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4 text-stone-700" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 1, 1))}
              className="bg-white w-9 h-9 rounded-lg shadow-md hover:bg-stone-100 transition flex items-center justify-center"
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4 text-stone-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">
        {label}
      </span>
    </span>
  );
}

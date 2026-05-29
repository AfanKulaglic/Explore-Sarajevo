"use client";

import { Map, Marker } from "pigeon-maps";
import { useState, useEffect, useRef } from "react";
import { AttractiveLocation } from "../../lib/types";
import { Plus, Minus, MapPin } from "lucide-react";

interface Props {
  id: string;
  attractions: AttractiveLocation[];
}

export default function AttractionLocation({ id, attractions }: Props) {
  const normalizedId = decodeURIComponent(id);
  const attraction = attractions.find((a) => a.slug === normalizedId);
  const [zoom, setZoom] = useState(15);
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

  if (!attraction || !attraction.location || !attraction.location.includes(",")) {
    return null;
  }

  const [latStr, lngStr] = attraction.location.split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8 md:pb-14">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-[#a78bfa]" />
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a78bfa]">
          ◆ Location · Find it
        </span>
      </div>
      <h2 className="text-xl md:text-3xl text-white font-semibold mb-4">
        Where to find it
      </h2>

      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ height: '360px', border: "1px solid var(--border)" }}
      >
        <Map
          height={mapHeight}
          center={[lat, lng]}
          zoom={zoom}
          mouseEvents={true}
          touchEvents={true}
          onBoundsChanged={({ center, zoom: z }) => setZoom(z)}
        >
          <Marker width={48} anchor={[lat, lng]} color="#0f766e" />
        </Map>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => setZoom((z) => Math.min(z + 1, 18))}
            className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center transition text-white"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 1, 1))}
            className="w-9 h-9 rounded-lg shadow-md flex items-center justify-center transition text-white"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

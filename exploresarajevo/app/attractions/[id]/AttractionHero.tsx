"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Tag } from "lucide-react";
import { AttractiveLocation } from "../../lib/types";
import {
  useLocalizedContent,
  useLanguage,
  useTranslation,
} from "../../lib/language-context";

interface Props {
  id: string;
  attractions: AttractiveLocation[];
}

export default function AttractionHero({ id, attractions }: Props) {
  const normalizedId = decodeURIComponent(id);
  const raw = attractions.find((a) => a.slug === normalizedId);
  const attraction = useLocalizedContent(raw);
  const { language } = useLanguage();
  const { t } = useTranslation();

  if (!attraction) {
    return (
      <section className="pt-32 pb-12 px-4 md:px-8 text-center">
        <h2 className="text-2xl text-[#a0a0b8]">
          {t("attraction.notFound")}
        </h2>
      </section>
    );
  }

  const mainImage =
    attraction.images?.[0] || "https://dummyimage.com/1920x1080/09090f/a0a0b8";
  const categories = attraction.categories || [];

  return (
    <section className="relative w-full">
      <div className="relative w-full h-[55vh] min-h-[380px] overflow-hidden">
        <Image
          src={mainImage}
          alt={attraction.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end pb-7 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#a78bfa] text-xs uppercase tracking-[0.25em] font-bold mb-5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>

            <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
              ◆ Profile · Attraction
            </span>

            <h1 className="mt-3 text-white text-3xl md:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight max-w-4xl">
              {attraction.name}
            </h1>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {categories.slice(0, 4).map((cat: any, i: number) => {
                  const catName =
                    language === "en" && cat.name_en ? cat.name_en : cat.name;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 backdrop-blur-md border border-white/20"
                    >
                      <Tag className="w-3 h-3" />
                      {catName}
                    </span>
                  );
                })}
              </div>
            )}

            {attraction.address && (
              <div className="mt-5 flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-4 h-4 text-[#a78bfa]" />
                <span>{attraction.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

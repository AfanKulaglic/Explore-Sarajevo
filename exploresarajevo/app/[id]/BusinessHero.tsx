"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Tag, Phone, Globe, Clock } from "lucide-react";
import { Business } from "../lib/types";
import {
  useLocalizedContent,
  useLanguage,
  useTranslation,
} from "../lib/language-context";
import { isOpenNow, hasApplicableHours } from "../lib/time";

interface Props {
  id: string;
  businesses: Business[];
}

export default function BusinessHero({ id, businesses }: Props) {
  const raw = businesses.find((b) => b.slug === id);
  const business = useLocalizedContent(raw);
  const { language } = useLanguage();
  const { t } = useTranslation();

  if (!business) {
    return (
      <section className="pt-32 pb-12 px-4 md:px-8 text-center">
        <h2 className="text-2xl text-[#a0a0b8]">
          {t("business.notFound")}
        </h2>
      </section>
    );
  }

  const images = business.images || [];
  const mainImage =
    images[0] || "https://dummyimage.com/1920x1080/09090f/a0a0b8";
  const categories = business.categories || [];
  const wh = (business as any).workingHours || (business as any).working_hours;
  const showStatus = wh && hasApplicableHours(wh);
  const open = showStatus ? isOpenNow(wh) : false;

  return (
    <section className="relative w-full">
      {/* Hero image */}
      <div className="relative w-full h-[55vh] min-h-[380px] overflow-hidden">
        <Image
          src={mainImage}
          alt={business.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end pb-7 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#a78bfa] text-xs uppercase tracking-[0.25em] font-bold mb-5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>

            {/* Eyebrow + status */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-[#a78bfa] text-[10px] uppercase tracking-[0.3em] font-bold">
                ◆ Profile · Business
              </span>
              {showStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                    open
                      ? "bg-green-500/90 text-white"
                      : "bg-black/80 text-white/90"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      open ? "bg-white animate-pulse" : "bg-white/70"
                    }`}
                  />
                  {open ? t("status.open") : t("status.closed")}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-white text-3xl md:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight max-w-4xl">
              {business.name}
            </h1>

            {/* Categories */}
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

            {/* Quick meta row */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
              {business.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#a78bfa]" />
                  {business.address}
                </span>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#a78bfa] transition"
                >
                  <Phone className="w-4 h-4 text-[#a78bfa]" />
                  {business.phone}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#a78bfa] transition truncate max-w-xs"
                >
                  <Globe className="w-4 h-4 text-[#a78bfa]" />
                  {business.website
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

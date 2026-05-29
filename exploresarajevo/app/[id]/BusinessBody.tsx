"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Business } from "../lib/types";
import {
  MapPin,
  Clock,
  Globe,
  Phone,
  Images,
  ExternalLink,
  Tag,
  Layers,
  Building2,
} from "lucide-react";
import {
  isOpenNow,
  hasApplicableHours,
  formatWorkingHours,
} from "../lib/time";
import Lightbox from "../components/Lightbox";
import {
  useLocalizedContent,
  useTranslation,
  useLanguage,
} from "../lib/language-context";
import { ItemRewardButton } from "../components/ItemRewardButton";

interface Props {
  id: string;
  businesses: Business[];
}

function OpenStatus({ workingHours }: { workingHours: string | undefined }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(() =>
    workingHours ? isOpenNow(workingHours) : false
  );
  useEffect(() => {
    if (!workingHours) return;
    const i = setInterval(() => setOpen(isOpenNow(workingHours)), 60000);
    return () => clearInterval(i);
  }, [workingHours]);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
        open ? "text-green-400" : "text-[#5a5a72]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          open ? "bg-green-400 animate-pulse" : "bg-[#5a5a72]"
        }`}
      />
      {open ? t("status.open") : t("status.closed")}
    </span>
  );
}

export default function BusinessBody({ id, businesses }: Props) {
  const rawBusiness = businesses.find((b) => b.slug === id);
  const business = useLocalizedContent(rawBusiness);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!business) return null;

  const allImages = business.images || [];
  const wh = business.working_hours || business.workingHours;

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const getTier = (): "premium" | "highlighted" | "regular" => {
    const cats = rawBusiness?.categories || [];
    const secs = rawBusiness?.sections || [];
    if (
      cats.some((c: any) => c.is_premium) ||
      secs.some((s: any) => s.is_premium)
    )
      return "premium";
    if (
      cats.some((c: any) => c.is_highlight && !c.is_premium) ||
      secs.some((s: any) => s.is_highlight && !s.is_premium)
    )
      return "highlighted";
    return "regular";
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5 md:space-y-8">
          {/* Description */}
          <article>
            <SectionHead
              icon={<Layers className="w-3.5 h-3.5" />}
              eyebrow="The story"
            />
            <h2 className="text-xl md:text-3xl text-white font-semibold mb-5 leading-tight">
              About {business.name}
            </h2>
            {business.description ? (
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: business.description }}
              />
            ) : (
              <p className="text-[#5a5a72] italic">
                {t("business.noDescription")}
              </p>
            )}
          </article>

          {/* Categories & types */}
          {((business.categories && business.categories.length > 0) ||
            (business.types && business.types.length > 0)) && (
            <article>
              <SectionHead
                icon={<Tag className="w-3.5 h-3.5" />}
                eyebrow={t("business.categoriesAndTypes")}
              />
              <div className="flex flex-wrap gap-2">
                {business.categories?.map((cat: any, i: number) => {
                  const name =
                    language === "en" && cat.name_en
                      ? cat.name_en
                      : typeof cat === "string"
                      ? cat
                      : cat?.name;
                  return (
                    <span
                      key={`cat-${i}`}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                      style={{
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "#a78bfa",
                      }}
                    >
                      {name}
                    </span>
                  );
                })}
                {business.types?.map((tp: any, i: number) => {
                  const name =
                    language === "en" && tp.name_en
                      ? tp.name_en
                      : typeof tp === "string"
                      ? tp
                      : tp?.name;
                  return (
                    <span
                      key={`type-${i}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-[#a0a0b8]"
                      style={{
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </article>
          )}

          {/* Gallery */}
          {allImages.length > 0 && (
            <article>
              <div className="flex items-baseline justify-between mb-5">
                <SectionHead
                  icon={<Images className="w-3.5 h-3.5" />}
                  eyebrow={t("business.gallery")}
                  noMargin
                />
                <span className="text-xs text-[#5a5a72] font-medium uppercase tracking-wider">
                  {allImages.length}{" "}
                  {allImages.length === 1 ? "photo" : "photos"}
                </span>
              </div>

              {allImages.length >= 3 ? (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[240px] md:h-[400px]">
                  <button
                    onClick={() => openLightbox(0)}
                    className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group"
                    style={{ background: "var(--bg-raised)" }}
                  >
                    <Image
                      src={allImages[0]}
                      alt={`${business.name}-1`}
                      fill
                      sizes="50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                      Cover
                    </span>
                  </button>
                  <button
                    onClick={() => openLightbox(1)}
                    className="col-span-2 relative rounded-2xl overflow-hidden group"
                    style={{ background: "var(--bg-raised)" }}
                  >
                    <Image
                      src={allImages[1]}
                      alt={`${business.name}-2`}
                      fill
                      sizes="50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>
                  <button
                    onClick={() => openLightbox(2)}
                    className="col-span-2 relative rounded-2xl overflow-hidden group"
                    style={{ background: "var(--bg-raised)" }}
                  >
                    <Image
                      src={allImages[2]}
                      alt={`${business.name}-3`}
                      fill
                      sizes="50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {allImages.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <span className="text-2xl font-semibold">
                          +{allImages.length - 3}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(i)}
                      className="relative h-48 rounded-2xl overflow-hidden group"
                      style={{ background: "var(--bg-raised)" }}
                    >
                      <Image
                        src={img}
                        alt={`${business.name}-${i}`}
                        fill
                        sizes="50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}

              {allImages.length > 3 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 thin-scroll">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(i)}
                      className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[#1e1e2e] hover:ring-[#7c3aed] transition"
                    >
                      <Image
                        src={img}
                        alt={`thumb-${i}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {/* Quick info */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-raised)",
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72]">
                Visitor info
              </p>
              <h3 className="text-xl text-white font-semibold mt-1">
                {t("business.quickInfo")}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {wh && hasApplicableHours(wh) && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-[#5a5a72] uppercase tracking-wider font-bold">
                    Status
                  </span>
                  <OpenStatus workingHours={wh} />
                </div>
              )}

              {business.address && (
                <SidebarRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                >
                  <p className="text-sm text-[#a0a0b8]">{business.address}</p>
                </SidebarRow>
              )}

              {business.phone && (
                <SidebarRow icon={<Phone className="w-4 h-4" />} label="Phone">
                  <a
                    href={`tel:${business.phone}`}
                    className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition"
                  >
                    {business.phone}
                  </a>
                </SidebarRow>
              )}

              {business.website && (
                <SidebarRow
                  icon={<Globe className="w-4 h-4" />}
                  label="Website"
                >
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition truncate block"
                  >
                    {business.website
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                  </a>
                </SidebarRow>
              )}

              {wh && (
                <SidebarRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Working hours"
                >
                  <pre className="text-sm text-[#a0a0b8] whitespace-pre-wrap font-sans leading-relaxed">
                    {formatWorkingHours(wh)}
                  </pre>
                </SidebarRow>
              )}

              {business.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    business.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition mt-3"
                  style={{ background: "var(--violet)" }}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("business.openInMaps")}
                </a>
              )}
            </div>
          </div>

          {/* Brand */}
          {business.brandName && (
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--bg-raised)", color: "#a78bfa" }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72]">
                  {t("business.brand")}
                </p>
                <p className="text-base font-semibold text-white">
                  {business.brandName}
                </p>
              </div>
            </div>
          )}

          {/* Reward button */}
          <ItemRewardButton
            itemSlug={id}
            itemType="business"
            tier={getTier()}
            className="w-full"
          />
        </aside>
      </div>

      <Lightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={business.name}
      />
    </section>
  );
}

function SectionHead({
  icon,
  eyebrow,
  noMargin,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  noMargin?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${noMargin ? "" : "mb-3"}`}
    >
      <span className="text-[#a78bfa]">{icon}</span>
      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a78bfa]">
        ◆ {eyebrow}
      </span>
    </div>
  );
}

function SidebarRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[#5a5a72]"
        style={{ background: "var(--bg-raised)" }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72] mb-0.5">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

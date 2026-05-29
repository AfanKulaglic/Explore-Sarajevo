"use client";

import { useState } from "react";
import Image from "next/image";
import { AttractiveLocation } from "../../lib/types";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Images,
  ExternalLink,
  Tag,
  Layers,
} from "lucide-react";
import Lightbox from "../../components/Lightbox";
import {
  useLocalizedContent,
  useTranslation,
  useLanguage,
} from "../../lib/language-context";
import { ItemRewardButton } from "../../components/ItemRewardButton";

interface Props {
  id: string;
  attractions: AttractiveLocation[];
}

export default function AttractionBody({ id, attractions }: Props) {
  const normalizedId = decodeURIComponent(id);
  const rawAttraction = attractions.find((a) => a.slug === normalizedId);
  const attraction = useLocalizedContent(rawAttraction);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!attraction) return null;

  const allImages = attraction.images || [];
  const hasCoords =
    attraction.location && attraction.location.includes(",");
  const mapUrl = attraction.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        attraction.address
      )}`
    : hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        attraction.location
      )}`
    : null;

  const hasQuickInfo =
    attraction.address ||
    attraction.phone ||
    attraction.email ||
    attraction.website;

  const getTier = (): "premium" | "highlighted" | "regular" => {
    return rawAttraction?.featuredLocation ? "highlighted" : "regular";
  };

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-5 md:space-y-8">
          {/* Description */}
          <article>
            <SectionHead
              icon={<Layers className="w-3.5 h-3.5" />}
              eyebrow="The story"
            />
            <h2 className="text-xl md:text-3xl text-white font-semibold mb-5 leading-tight">
              About {attraction.name}
            </h2>
            {attraction.description ? (
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: attraction.description }}
              />
            ) : (
              <p className="text-[#5a5a72] italic">
                {t("attraction.noDescription")}
              </p>
            )}
          </article>

          {/* Categories & types */}
          {((attraction.categories && attraction.categories.length > 0) ||
            (attraction.types && attraction.types.length > 0)) && (
            <article>
              <SectionHead
                icon={<Tag className="w-3.5 h-3.5" />}
                eyebrow={t("business.categoriesAndTypes")}
              />
              <div className="flex flex-wrap gap-2">
                {attraction.categories?.map((c: any) => {
                  const name =
                    language === "en" && c.name_en ? c.name_en : c.name;
                  return (
                    <span
                      key={c.id}
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
                {attraction.types?.map((tp: any) => {
                  const name =
                    language === "en" && tp.name_en ? tp.name_en : tp.name;
                  return (
                    <span
                      key={tp.id}
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
                  eyebrow={t("attraction.photos")}
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
                      alt={`${attraction.name}-1`}
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
                      alt={`${attraction.name}-2`}
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
                      alt={`${attraction.name}-3`}
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
                        alt={`${attraction.name}-${i}`}
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
          {hasQuickInfo && (
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
                  {t("attraction.quickInfo")}
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {attraction.address && (
                  <SidebarRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                  >
                    {mapUrl ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition"
                      >
                        {attraction.address}
                      </a>
                    ) : (
                      <p className="text-sm text-[#a0a0b8]">
                        {attraction.address}
                      </p>
                    )}
                  </SidebarRow>
                )}

                {attraction.phone && (
                  <SidebarRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                  >
                    <a
                      href={`tel:${attraction.phone}`}
                      className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition"
                    >
                      {attraction.phone}
                    </a>
                  </SidebarRow>
                )}

                {attraction.email && (
                  <SidebarRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                  >
                    <a
                      href={`mailto:${attraction.email}`}
                      className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition truncate block"
                    >
                      {attraction.email}
                    </a>
                  </SidebarRow>
                )}

                {attraction.website && (
                  <SidebarRow
                    icon={<Globe className="w-4 h-4" />}
                    label="Website"
                  >
                    <a
                      href={
                        attraction.website.startsWith("http")
                          ? attraction.website
                          : `https://${attraction.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#a78bfa] hover:text-[#7c3aed] transition truncate block"
                    >
                      {attraction.website
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </a>
                  </SidebarRow>
                )}

                {mapUrl && (
                  <a
                    href={mapUrl}
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
          )}

          <ItemRewardButton
            itemSlug={normalizedId}
            itemType="attraction"
            tier={getTier()}
            className="w-full"
          />
        </aside>
      </div>

      {allImages.length > 0 && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={attraction.name}
        />
      )}
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
    <div className={`flex items-center gap-2 ${noMargin ? "" : "mb-3"}`}>
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

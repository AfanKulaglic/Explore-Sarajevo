"use client";

import FeaturedGrid, { GridItem } from "./FeaturedGrid";
import { AttractiveLocation } from "../lib/types";
import { useTranslation } from "../lib/language-context";

interface Props {
  attractions: AttractiveLocation[];
}

export default function AttractionsBand({ attractions }: Props) {
  const { t } = useTranslation();
  if (!attractions || attractions.length === 0) return null;

  // Map AttractiveLocation to GridItem — mark as attraction so links go to /attractions/slug
  const items: GridItem[] = attractions.map(a => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    place_type: "attraction",
    categoryId: a.categoryId,
    images: a.images,
    address: a.address,
    categories: a.categories as any,
  }));

  return (
    <FeaturedGrid
      items={items}
      eyebrow="◆ Explore the city"
      title={t("sections.attractiveLocations")}
      subtitle="Sarajevo's landmarks, parks, and cultural sites — marked on the map and ready to visit."
      background="var(--bg-surface)"
    />
  );
}

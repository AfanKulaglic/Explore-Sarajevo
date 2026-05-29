"use client";

import FeaturedGrid, { GridItem } from "./FeaturedGrid";
import { Business } from "../lib/types";
import { useTranslation } from "../lib/language-context";

interface Props {
  businesses: Business[];
}

export default function FeaturedBusinesses({ businesses }: Props) {
  const { t } = useTranslation();
  if (!businesses || businesses.length === 0) return null;

  // Cast Business[] to GridItem[] — shapes are compatible
  const items = businesses as unknown as GridItem[];

  return (
    <FeaturedGrid
      items={items}
      eyebrow="◆ On the scene"
      title={t("sections.attractiveBusinesses")}
      subtitle="Businesses worth knowing about — from local favourites to hidden gems."
      background="var(--bg-base)"
    />
  );
}

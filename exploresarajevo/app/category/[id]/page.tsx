import { notFound } from "next/navigation";
import { getBusinesses, getCategories, getAttractions } from "../../lib/api";
import CategoryHero from "./CategoryHero";
import CategoryMap from "./CategoryMap";
import CategoryFeatured from "./CategoryFeatured";
import CategoryDirectory from "./CategoryDirectory";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;

  const [businesses, categories, attractions] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getAttractions(),
  ]);

  const currentCategory = categories.find(
    (t: { slug?: string }) => t.slug === id
  );
  if (!currentCategory) notFound();

  const currentCategoryId = currentCategory.id;

  // Premium for this category
  const premiumBusinesses = businesses.filter((b: any) =>
    b.categories?.some(
      (t: any) => t.id === currentCategoryId && t.is_premium === true
    )
  );
  const premiumAttractions = (attractions || [])
    .filter((a: any) =>
      a.categories?.some(
        (t: any) => t.id === currentCategoryId && t.is_premium === true
      )
    )
    .map((a: any) => ({ ...a, place_type: "attraction" }));
  const mergedPremium = [...premiumBusinesses, ...premiumAttractions];

  // Highlights for this category (non-premium)
  const highlightBusinesses = businesses.filter((b: any) =>
    b.categories?.some(
      (t: any) =>
        t.id === currentCategoryId &&
        t.is_highlight === true &&
        t.is_premium !== true
    )
  );
  const highlightAttractions = (attractions || [])
    .filter((a: any) =>
      a.categories?.some(
        (t: any) =>
          t.id === currentCategoryId &&
          t.is_highlight === true &&
          t.is_premium !== true
      )
    )
    .map((a: any) => ({ ...a, place_type: "attraction" }));
  const mergedHighlights = [...highlightBusinesses, ...highlightAttractions];

  // Everything in category for the directory
  const attractionsWithType = (attractions || []).map((a: any) => ({
    ...a,
    place_type: "attraction",
  }));
  const mergedAll = [...businesses, ...attractionsWithType];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <CategoryHero
        category={currentCategory}
        premium={mergedPremium}
      />

      <CategoryMap
        businesses={businesses}
        attractions={attractions || []}
        category={currentCategory}
      />

      {mergedHighlights.length > 0 && (
        <CategoryFeatured
          items={mergedHighlights}
          categoryName={currentCategory.name}
        />
      )}

      <CategoryDirectory
        items={mergedAll}
        category={currentCategory}
      />
    </div>
  );
}

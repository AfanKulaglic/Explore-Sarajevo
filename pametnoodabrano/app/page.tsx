import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import CategoryProductsShowcase from "./components/CategoryProductsShowcase";
import Features from "./components/Features";
import CTASection from "./components/CTASection";
import { getCollectionData } from "./lib/data";

// Force dynamic rendering — never cache the full page
// This ensures CMS changes are reflected immediately
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getCollectionData();
  
  // Sort featured items by order
  const featuredItems = data.items
    .filter((item) => item.featured)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
  
  // Hero gets the first featured item (display_order 1)
  const heroItem = featuredItems[0];
  
  // Istaknuti članci gets the rest (display_order 2+)
  const istaknutiItems = featuredItems.slice(1);
  
  const categories = data.categories?.[0] || [];

  return (
    <>
      <Hero featuredItems={heroItem ? [heroItem] : []} />
      <Features />
      <FeaturedProducts products={data.items} featuredItems={istaknutiItems} />
      <CategoryProductsShowcase categories={categories} products={data.items} />
      <CTASection />
    </>
  );
}

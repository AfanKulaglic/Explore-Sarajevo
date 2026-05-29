import { getCollectionData } from "../lib/data";
import ProductsGrid from "./ProductsGrid";
import { ProductsPageHeader } from "../components/PageHeaders";

export const metadata = {
  title: "Članci | Saraya",
  description: "Istraži naše recenzije i vodiče za tehnološke proizvode",
};

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const data = await getCollectionData();
  
  // Get unique categories with their English translations
  const categoryMap: Record<string, string> = {};
  data.items.forEach((item) => {
    if (item.category && !categoryMap[item.category]) {
      categoryMap[item.category] = item.category_en || '';
    }
  });
  const categories = Object.keys(categoryMap);

  return (
    <div className="pt-20 lg:pt-28">
      {/* Hero */}
      <ProductsPageHeader />

      {/* Products */}
      <ProductsGrid products={data.items} categories={categories} categoryTranslations={categoryMap} />
    </div>
  );
}

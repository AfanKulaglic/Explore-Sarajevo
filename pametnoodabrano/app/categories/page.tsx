import { getCollectionData } from "../lib/data";
import CategoriesGrid from "../components/CategoriesGrid";
import { CategoriesPageHeader } from "../components/PageHeaders";

export const metadata = {
  title: "Kategorije | Saraya",
  description: "Istraži naše kategorije proizvoda",
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const data = await getCollectionData();
  const categories = data.categories?.[0] || [];

  return (
    <div className="pt-20 lg:pt-28">
      {/* Hero */}
      <CategoriesPageHeader />

      {/* Categories */}
      <CategoriesGrid categories={categories} />
    </div>
  );
}

import { getCollectionData } from "../../lib/data";
import CategoryPageContent from "./CategoryPageContent";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);

  return {
    title: `${categoryName} | Saraya`,
    description: `Istraži proizvode u kategoriji ${categoryName}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);
  const data = await getCollectionData();

  const categoryProducts = data.items.filter(
    (item) => item.category.toLowerCase() === categoryName.toLowerCase()
  );

  const categoryInfo = data.categories?.[0]?.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <CategoryPageContent 
      categoryName={categoryName}
      categoryInfo={categoryInfo}
      categoryProducts={categoryProducts}
    />
  );
}

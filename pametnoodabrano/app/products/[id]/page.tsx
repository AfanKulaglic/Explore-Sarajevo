import { notFound } from "next/navigation";
import { getCollectionData } from "../../lib/data";
import ProductDetail from "./ProductDetail";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCollectionData();
  // Match by slug first, then fall back to id for backwards compatibility
  const product = data.items.find((item) => item.slug === id || item.id === id);

  if (!product) {
    return { title: "Proizvod nije pronađen | Saraya" };
  }

  return {
    title: `${product.title} | Saraya`,
    description: product.short_description,
    openGraph: {
      title: product.title,
      description: product.short_description,
      images: [product.image.url],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCollectionData();
  // Match by slug first, then fall back to id for backwards compatibility
  const product = data.items.find((item) => item.slug === id || item.id === id);

  if (!product) {
    notFound();
  }

  // Get related products (same category, exclude current)
  const relatedProducts = data.items
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  // If not enough related, fill with other products
  if (relatedProducts.length < 4) {
    const otherProducts = data.items
      .filter((item) => item.id !== product.id && !relatedProducts.includes(item))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...otherProducts);
  }

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}

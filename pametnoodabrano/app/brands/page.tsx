import { getCollectionData } from "../lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandsPageHeader, FeaturedBrandHeader } from "../components/PageHeaders";
import { Brand } from "../lib/types";
import FeaturedBrand from "./FeaturedBrand";

export const metadata = {
  title: "Brendovi | Saraya",
  description: "Istraži brendove na Saraya platformi",
};

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const data = await getCollectionData();
  
  // Get unique brands from products
  const brandsMap = new Map<string, { name: string; logo?: string; count: number }>();
  
  data.items.forEach((item) => {
    const existing = brandsMap.get(item.company.name);
    if (existing) {
      existing.count++;
    } else {
      brandsMap.set(item.company.name, {
        name: item.company.name,
        logo: item.company.logo,
        count: 1,
      });
    }
  });

  const brands = Array.from(brandsMap.values());

  return (
    <div className="pt-20 lg:pt-28">
      {/* Hero */}
      <BrandsPageHeader />

      {/* Brands Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        loading="eager"
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-300">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {brand.count} {brand.count === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brand */}
      {data.brands && data.brands.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedBrandHeader />
            {data.brands.map((brand) => (
              <FeaturedBrand key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

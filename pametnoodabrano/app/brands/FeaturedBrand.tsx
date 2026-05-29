"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "../lib/types";
import { useLanguage, useLocalizedContent } from "../lib/language-context";

interface FeaturedBrandProps {
  brand: Brand;
}

export default function FeaturedBrand({ brand }: FeaturedBrandProps) {
  const { language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  
  // Get localized description
  const description = getLocalizedField(brand, 'description');
  const viewProductsText = language === 'en' ? 'View products' : 'Pogledaj proizvode';
  
  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="flex items-center gap-4 mb-6">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={64}
                height={64}
                loading="eager"
                className="rounded-xl"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{brand.name}</h3>
              {brand.headquarters && (
                <p className="text-gray-500">{brand.headquarters}</p>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-6">{description}</p>
          
          {brand.values && brand.values.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {brand.values.map((value) => (
                <span
                  key={value}
                  className="px-4 py-2 bg-violet-100 text-violet-700 text-sm font-medium rounded-full"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
          
          <Link
            href={`/products?brand=${encodeURIComponent(brand.name)}`}
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:gap-3 transition-all"
          >
            {viewProductsText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          {brand.logo && (
            <Image
              src={brand.logo}
              alt={brand.name}
              width={200}
              height={200}
              loading="eager"
              className="object-contain opacity-80"
            />
          )}
        </div>
      </div>
    </div>
  );
}

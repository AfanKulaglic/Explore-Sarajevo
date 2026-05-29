"use client";

import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Item, CategoryData } from "../../lib/types";
import { useLanguage, useLocalizedContent } from "../../lib/language-context";

interface CategoryPageContentProps {
  categoryName: string;
  categoryInfo?: CategoryData;
  categoryProducts: Item[];
}

export default function CategoryPageContent({ 
  categoryName, 
  categoryInfo, 
  categoryProducts 
}: CategoryPageContentProps) {
  const { language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  
  // Localized text
  const allCategories = language === 'en' ? 'All categories' : 'Sve kategorije';
  const showing = language === 'en' ? 'Showing' : 'Prikazano';
  const productWord = categoryProducts.length === 1 
    ? (language === 'en' ? 'product' : 'proizvod')
    : (language === 'en' ? 'products' : 'proizvoda');
  const noProducts = language === 'en' ? 'No products' : 'Nema proizvoda';
  const noProductsDesc = language === 'en' 
    ? 'There are currently no products in this category.' 
    : 'Trenutno nema proizvoda u ovoj kategoriji.';
  const viewAllProducts = language === 'en' ? 'View all products' : 'Pogledaj sve proizvode';
  
  // Get localized category info
  const localizedCategoryName = categoryInfo ? getLocalizedField(categoryInfo, 'name') : categoryName;
  const localizedCategoryText = categoryInfo ? getLocalizedField(categoryInfo, 'text') : '';
  
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {allCategories}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {localizedCategoryName}
          </h1>
          {localizedCategoryText && (
            <p className="text-xl text-white/80 max-w-2xl">
              {localizedCategoryText}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryProducts.length > 0 ? (
            <>
              <p className="text-gray-500 mb-8">
                {showing} <span className="font-semibold text-gray-900">{categoryProducts.length}</span>{" "}
                {productWord}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {noProducts}
              </h3>
              <p className="text-gray-500 mb-6">
                {noProductsDesc}
              </p>
              <Link
                href="/products"
                className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
              >
                {viewAllProducts}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

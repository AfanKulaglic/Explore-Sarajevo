"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Item } from "../lib/types";
import { useLanguage } from "../lib/language-context";

interface ProductsGridProps {
  products: Item[];
  categories: string[];
  categoryTranslations?: Record<string, string>;
}

export default function ProductsGrid({ products, categories, categoryTranslations = {} }: ProductsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { t, language } = useLanguage();

  // Helper to get localized category name
  const getLocalizedCategory = (category: string) => {
    if (language === 'en' && categoryTranslations[category]) {
      return categoryTranslations[category];
    }
    return category;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.short_description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Default sorting by order
    result.sort((a, b) => (a.order || 999) - (b.order || 999));

    return result;
  }, [products, searchQuery, selectedCategory]);

  return (
    <div>
      {/* Filters Bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("products.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border border-violet-400/50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-3 bg-gray-100 rounded-xl flex-shrink-0 border border-violet-400/50"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Category Pills */}
          <div className={`flex flex-wrap gap-2 mt-4 ${showFilters ? "block" : "hidden sm:flex"}`}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("common.all")}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {getLocalizedCategory(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-gray-500">
          {t("products.showing")} <span className="font-semibold text-gray-900">{filteredProducts.length}</span>{" "}
          {filteredProducts.length === 1 ? t("products.product") : t("products.products")}
          {selectedCategory && (
            <span>
              {" "}
              {t("products.inCategory")}{" "}
              <span className="font-semibold text-violet-600">{getLocalizedCategory(selectedCategory)}</span>
            </span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("products.noResultsTitle")}
            </h3>
            <p className="text-gray-500 mb-6">
              {t("products.noResultsDescription")}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              {t("products.resetFilters")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

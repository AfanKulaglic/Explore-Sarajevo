"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard, { FeaturedProductCard, SmallFeaturedCard } from "./ProductCard";
import { Item } from "../lib/types";
import { useLanguage } from "../lib/language-context";

interface FeaturedProductsProps {
  products: Item[];
  featuredItems?: Item[];
}

export default function FeaturedProducts({ products, featuredItems = [] }: FeaturedProductsProps) {
  const { t } = useLanguage();
  
  // Use provided featuredItems, or fall back to filtering from products
  const featured = featuredItems.length > 0 
    ? featuredItems.slice(0, 6)
    : products.filter((p) => p.featured).slice(0, 6);
  
  // If not enough featured, fill with regular products
  const allFeatured = featured.length >= 6 
    ? featured 
    : [...featured, ...products.filter((p) => !p.featured && !featured.find(f => f.id === p.id)).slice(0, 6 - featured.length)];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8"
        >
          <div>
            <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
              {t("featured.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("featured.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              {t("featured.description")}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:gap-4 transition-all"
          >
            {t("featured.viewAllArticles")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Alternating Layout: 2-1-2-1 */}
        <div className="space-y-4 sm:space-y-5">
          {/* Row 1: 2 small cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {allFeatured.slice(0, 2).map((product, index) => (
              <SmallFeaturedCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Row 2: 1 large card */}
          {allFeatured[2] && (
            <FeaturedProductCard product={allFeatured[2]} index={2} />
          )}

          {/* Row 3: 2 small cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {allFeatured.slice(3, 5).map((product, index) => (
              <SmallFeaturedCard key={product.id} product={product} index={index + 3} />
            ))}
          </div>

          {/* Row 4: 1 large card */}
          {allFeatured[5] && (
            <FeaturedProductCard product={allFeatured[5]} index={5} />
          )}
        </div>
      </div>
    </section>
  );
}

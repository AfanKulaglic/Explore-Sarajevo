"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Item } from "../lib/types";
import { useLanguage, useLocalizedContent } from "../lib/language-context";

interface ProductCardProps {
  product: Item;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  
  // Get localized content
  const title = getLocalizedField(product, 'title');
  const shortDescription = getLocalizedField(product, 'short_description');
  const imageAlt = getLocalizedField(product, 'image_alt') || getLocalizedField(product.image, 'alt') || title;
  const badges = getLocalizedArray(product, 'badges');
  const categoryName = getLocalizedField(product, 'category');

  return (
    <div>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-violet-200">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={product.image.url}
              alt={imageAlt}
              fill
              loading="eager"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Badges */}
            {badges && badges.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {badges.slice(0, 2).map((badge) => (
                  <span
                    key={badge}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      badge === "Novo" || badge === "New"
                        ? "bg-emerald-500 text-white"
                        : badge === "Top" || badge === "Urednički izbor" || badge === "Editor's Choice"
                        ? "bg-violet-500 text-white"
                        : "bg-gray-900/80 text-white backdrop-blur-sm"
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Quick View Button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-medium rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {t("products.quickView")}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <div className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-2">
              {categoryName}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {shortDescription}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-violet-600 font-medium">{t("common.readMore")} →</span>
              
              {/* Rating */}
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-gray-600">
                  {(product.ranking_score || 4.5).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Featured Product Card (smaller, compact variant)
export function FeaturedProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  
  // Get localized content
  const title = getLocalizedField(product, 'title');
  const shortDescription = getLocalizedField(product, 'short_description');
  const imageAlt = getLocalizedField(product, 'image_alt') || getLocalizedField(product.image, 'alt') || title;
  const badges = getLocalizedArray(product, 'badges');
  const keyFeatures = getLocalizedArray(product, 'key_features');
  const categoryName = getLocalizedField(product, 'category');

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-[16/9] md:aspect-[4/3] overflow-hidden">
              <Image
                src={product.image.url}
                alt={imageAlt}
                fill
                loading="eager"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-gray-950/80 md:to-gray-950" />
            </div>

            {/* Content */}
            <div className="relative p-5 sm:p-6 md:p-8 flex flex-col justify-center">
              {/* Badge */}
              {badges?.[0] && (
                <div className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-xs font-medium mb-3">
                  <Star className="w-3 h-3 fill-current" />
                  {badges[0]}
                </div>
              )}

              {/* Category */}
              <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-1.5">
                {categoryName}
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {shortDescription}
              </p>

              {/* Features - hidden on mobile */}
              {keyFeatures && keyFeatures.length > 0 && (
                <ul className="hidden md:flex flex-wrap gap-1.5 mb-4">
                  {keyFeatures.slice(0, 3).map((feature) => (
                    <li
                      key={feature}
                      className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("featured.badge")}</span>
                <span className="inline-flex items-center gap-2 text-violet-400 font-medium text-sm group-hover:gap-3 transition-all">
                  {t("common.readMore")}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Small Featured Card (for 2-column rows)
export function SmallFeaturedCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  
  // Get localized content
  const title = getLocalizedField(product, 'title');
  const shortDescription = getLocalizedField(product, 'short_description');
  const imageAlt = getLocalizedField(product, 'image_alt') || getLocalizedField(product.image, 'alt') || title;
  const badges = getLocalizedArray(product, 'badges');
  const categoryName = getLocalizedField(product, 'category');

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 h-full">
          {/* Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
            <Image
              src={product.image.url}
              alt={imageAlt}
              fill
              loading="eager"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            
            {/* Badge overlay */}
            {badges?.[0] && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-violet-500/90 rounded-full text-white text-[10px] sm:text-xs font-medium">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                {badges[0]}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-5">
            {/* Category - hidden on small mobile */}
            <div className="hidden sm:block text-xs font-medium text-violet-400 uppercase tracking-wider mb-1.5">
              {categoryName}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-lg font-bold text-white mb-1 sm:mb-2 group-hover:text-violet-300 transition-colors line-clamp-2">
              {title}
            </h3>

            {/* Description - hidden on small mobile */}
            <p className="hidden sm:block text-gray-400 text-sm mb-3 line-clamp-2">
              {shortDescription}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="hidden sm:inline text-xs text-gray-500">{t("featured.badge")}</span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-violet-400 font-medium text-xs sm:text-sm group-hover:gap-2 transition-all">
                {t("common.readMore")}
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

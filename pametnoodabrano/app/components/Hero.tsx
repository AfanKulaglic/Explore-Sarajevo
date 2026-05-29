"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Item } from "../lib/types";
import { useLanguage, useLocalizedContent } from "../lib/language-context";

interface HeroProps {
  featuredItems: Item[];
}

export default function Hero({ featuredItems }: HeroProps) {
  const mainProduct = featuredItems[0];
  const { t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  
  // Get localized content for main product
  const productTitle = mainProduct ? getLocalizedField(mainProduct, 'title') : '';
  const productDescription = mainProduct ? getLocalizedField(mainProduct, 'short_description') : '';
  const productBadges = mainProduct ? getLocalizedArray(mainProduct, 'badges') : [];
  const productFeatures = mainProduct ? getLocalizedArray(mainProduct, 'key_features') : [];
  const productImageAlt = mainProduct ? (getLocalizedField(mainProduct, 'image_alt') || productTitle) : '';
  const productCategory = mainProduct ? getLocalizedField(mainProduct, 'category') : '';

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-12rem)]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.badge")}</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              {t("hero.title1")}
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 px-2 sm:px-0">
              {t("hero.description")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 px-6 sm:px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 w-full sm:w-auto justify-center"
              >
                {t("hero.exploreArticles")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all w-full sm:w-auto justify-center"
              >
                {t("hero.allCategories")}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 mt-12 pt-12 border-t border-white/10">
              {[
                { value: "200+", label: t("hero.stats.articles") },
                { value: "50+", label: t("hero.stats.brands") },
                { value: "4.9", label: t("hero.stats.rating") },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Showcase - Clean single product */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {mainProduct && (
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-2xl opacity-30" />
                
                <Link
                  href={`/products/${mainProduct.slug}`}
                  className="relative block group"
                >
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden hover:border-violet-500/50 transition-all duration-500">
                    {/* Badges */}
                    <div className="absolute top-6 left-6 flex gap-2 z-10">
                      {productBadges?.slice(0, 2).map((badge) => (
                        <span
                          key={badge}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            badge === "Novo" || badge === "New"
                              ? "bg-emerald-500 text-white"
                              : "bg-violet-500 text-white"
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[4/3] mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      <Image
                        src={mainProduct.image.url}
                        alt={productImageAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                          {productCategory}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl lg:text-3xl font-bold text-white group-hover:text-violet-300 transition-colors">
                        {productTitle}
                      </h3>
                      
                      <p className="text-gray-400">
                        {productDescription}
                      </p>

                      {/* Key Features */}
                      {productFeatures && productFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {productFeatures.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-sm text-gray-400">{t("featured.badge")}</span>
                        <span className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full text-violet-300 font-medium group-hover:bg-violet-500 group-hover:text-white transition-all">
                          {t("common.readMore")}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-widest">{t("common.explore")}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-gray-500 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

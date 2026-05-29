"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Item, CategoryData } from "../lib/types";
import { useLanguage, useLocalizedContent } from "../lib/language-context";

interface CategoryProductsShowcaseProps {
  categories: CategoryData[];
  products: Item[];
}

const categoryColors: Record<string, { bg: string; gradient: string }> = {
  "Pametni uređaji": { bg: "bg-blue-500", gradient: "from-blue-500 to-cyan-500" },
  "Snaga zvuka": { bg: "bg-violet-500", gradient: "from-violet-500 to-purple-500" },
  "Vizuelna Elegancija": { bg: "bg-rose-500", gradient: "from-rose-500 to-pink-500" },
  "Dom pun doživljaja": { bg: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500" },
  "Uhvatite svaki trenutak": { bg: "bg-amber-500", gradient: "from-amber-500 to-orange-500" },
  "Kontrola na dohvat ruke": { bg: "bg-indigo-500", gradient: "from-indigo-500 to-blue-500" },
};

const categoryIcons: Record<string, string> = {
  "Pametni uređaji": "💻",
  "Snaga zvuka": "🎧",
  "Vizuelna Elegancija": "📺",
  "Dom pun doživljaja": "🏠",
  "Uhvatite svaki trenutak": "📸",
  "Kontrola na dohvat ruke": "⌨️",
};

interface CategorySectionProps {
  category: CategoryData;
  products: Item[];
  colors: { bg: string; gradient: string };
  icon: string;
  index: number;
}

function CategorySection({ category, products, colors, icon, index }: CategorySectionProps) {
  const { t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [visibleProducts, setVisibleProducts] = useState(4);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollDirection = useRef<'forward' | 'backward'>('forward');
  
  // Localized category content
  const categoryName = getLocalizedField(category, 'name');
  const categoryText = getLocalizedField(category, 'text');
  
  useEffect(() => {
    const getVisible = () => {
      if (typeof window === 'undefined') return 4;
      if (window.innerWidth < 640) return 2;
      if (window.innerWidth < 1024) return 3;
      return 4;
    };
    const handleResize = () => setVisibleProducts(getVisible());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleProducts);
  const isMobile = visibleProducts <= 2;

  // Auto-scroll every 3 seconds (desktop only)
  useEffect(() => {
    if (isPaused || products.length <= visibleProducts || isMobile) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, products.length, visibleProducts, isMobile]);

  // Mobile slow auto-scroll
  useEffect(() => {
    if (!isMobile || isPaused || !mobileScrollRef.current) return;
    
    const container = mobileScrollRef.current;
    const scrollSpeed = 0.5; // pixels per frame
    let animationId: number;
    
    const animate = () => {
      if (!container) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (mobileScrollDirection.current === 'forward') {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= maxScroll) {
          mobileScrollDirection.current = 'backward';
        }
      } else {
        container.scrollLeft -= scrollSpeed;
        if (container.scrollLeft <= 0) {
          mobileScrollDirection.current = 'forward';
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [isMobile, isPaused]);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 10000);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  const goToPrev = () => {
    pauseAutoScroll();
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    pauseAutoScroll();
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Mouse wheel handling (desktop only)
  const handleWheel = (e: React.WheelEvent) => {
    if (isMobile) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaX || e.deltaY;
      if (Math.abs(delta) > 20) {
        if (delta > 0) goToNext();
        else goToPrev();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl sm:text-2xl shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{categoryName}</h3>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">{categoryText}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      {isMobile ? (
        // Mobile: Native smooth scroll with auto-rotation
        <div 
          ref={mobileScrollRef}
          className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
          onTouchStart={pauseAutoScroll}
          onMouseDown={pauseAutoScroll}
        >
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {products.map((product) => {
              const title = getLocalizedField(product, 'title');
              const imageAlt = getLocalizedField(product, 'image_alt') || title;
              const badges = getLocalizedArray(product, 'badges');
              return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex-shrink-0 w-[150px] group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border border-gray-100">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={product.image.url}
                      alt={imageAlt}
                      fill
                      loading="eager"
                      className="object-cover"
                    />
                    {badges && badges[0] && (
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        badges[0] === "Novo" || badges[0] === "New" ? "bg-emerald-500 text-white" : "bg-violet-500 text-white"
                      }`}>
                        {badges[0]}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">
                      {title}
                    </h4>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      ) : (
        // Desktop: Controlled carousel
        <div onWheel={handleWheel}>
          <div className="overflow-hidden px-1">
            <motion.div
              className="flex gap-4"
              animate={{ x: `-${currentIndex * (100 / visibleProducts)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {products.map((product) => {
                const title = getLocalizedField(product, 'title');
                const shortDescription = getLocalizedField(product, 'short_description');
                const imageAlt = getLocalizedField(product, 'image_alt') || title;
                const badges = getLocalizedArray(product, 'badges');
                return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`flex-shrink-0 ${visibleProducts === 3 ? "w-[calc(33.333%-10.67px)]" : "w-[calc(25%-12px)]"} group`}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Image
                        src={product.image.url}
                        alt={imageAlt}
                        fill
                        loading="eager"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {badges && badges[0] && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                          badges[0] === "Novo" || badges[0] === "New" ? "bg-emerald-500 text-white" : "bg-violet-500 text-white"
                        }`}>
                          {badges[0]}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-violet-600 transition-colors">
                        {title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {shortDescription}
                      </p>
                    </div>
                  </div>
                </Link>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Arrows + Link */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {!isMobile && products.length > visibleProducts && (
          <button
            onClick={goToPrev}
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-lg transition-all border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <Link
          href={`/categories/${encodeURIComponent(category.name)}`}
          className="inline-flex items-center gap-2 text-violet-600 font-medium hover:gap-3 transition-all"
        >
          {t("categories.viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>

        {!isMobile && products.length > visibleProducts && (
          <button
            onClick={goToNext}
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-lg transition-all border border-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dots Indicator - Desktop only */}
      {!isMobile && products.length > visibleProducts && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                pauseAutoScroll();
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-violet-600 w-6" : "bg-gray-300 hover:bg-gray-400 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function CategoryProductsShowcase({ categories, products }: CategoryProductsShowcaseProps) {
  const { t } = useLanguage();

  // Group products by category
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category.name] = products.filter((p) => p.category === category.name).slice(0, 8);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <section className="pt-12 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
            {t("categories.exploreByCategory")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("categories.description")}
          </p>
        </motion.div>

        {/* Categories with Products */}
        <div className="space-y-16">
          {categories.map((category, index) => {
            const categoryProducts = productsByCategory[category.name] || [];
            const colors = categoryColors[category.name] || { bg: "bg-gray-500", gradient: "from-gray-500 to-gray-600" };
            const icon = categoryIcons[category.name] || "📦";

            if (categoryProducts.length === 0) return null;

            return (
              <CategorySection
                key={category.name}
                category={category}
                products={categoryProducts}
                colors={colors}
                icon={icon}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

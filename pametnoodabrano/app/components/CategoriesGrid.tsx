"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryData } from "../lib/types";
import { useLanguage, useLocalizedContent } from "../lib/language-context";

interface CategoriesGridProps {
  categories: CategoryData[];
}

const categoryIcons: Record<string, string> = {
  "Pametni uređaji": "💻",
  "Snaga zvuka": "🎧",
  "Vizuelna Elegancija": "📺",
  "Dom pun doživljaja": "🏠",
  "Uhvatite svaki trenutak": "📸",
  "Kontrola na dohvat ruke": "⌨️",
};

const categoryColors: Record<string, { bg: string; text: string; hover: string }> = {
  "Pametni uređaji": { bg: "from-blue-500 to-cyan-500", text: "text-blue-600", hover: "group-hover:from-blue-600 group-hover:to-cyan-600" },
  "Snaga zvuka": { bg: "from-violet-500 to-purple-500", text: "text-violet-600", hover: "group-hover:from-violet-600 group-hover:to-purple-600" },
  "Vizuelna Elegancija": { bg: "from-rose-500 to-pink-500", text: "text-rose-600", hover: "group-hover:from-rose-600 group-hover:to-pink-600" },
  "Dom pun doživljaja": { bg: "from-emerald-500 to-teal-500", text: "text-emerald-600", hover: "group-hover:from-emerald-600 group-hover:to-teal-600" },
  "Uhvatite svaki trenutak": { bg: "from-amber-500 to-orange-500", text: "text-amber-600", hover: "group-hover:from-amber-600 group-hover:to-orange-600" },
  "Kontrola na dohvat ruke": { bg: "from-indigo-500 to-blue-500", text: "text-indigo-600", hover: "group-hover:from-indigo-600 group-hover:to-blue-600" },
};

// Localized category card component
function LocalizedCategoryCard({ category, index }: { category: CategoryData; index: number }) {
  const { t } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();
  
  const colors = categoryColors[category.name] || { bg: "from-gray-500 to-gray-600", text: "text-gray-600", hover: "" };
  const icon = categoryIcons[category.name] || "📦";
  
  // Get localized name and description
  const name = getLocalizedField(category, 'name');
  const text = getLocalizedField(category, 'text');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link
        href={`/categories/${encodeURIComponent(category.name)}`}
        className="group block"
      >
        <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden">
          {/* Background Gradient (on hover) */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          {/* Icon */}
          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
            {name}
          </h3>
          <p className="text-gray-500 mb-6">
            {text}
          </p>

          {/* Link */}
          <div className="flex items-center gap-2 text-violet-600 font-medium">
            <span>{t("categories.explore")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>

          {/* Decorative Elements */}
          <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
            {t("categories.title")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("categories.exploreByCategory")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("categories.description")}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <LocalizedCategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

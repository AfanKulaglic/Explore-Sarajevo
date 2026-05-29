"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Star, BookOpen } from "lucide-react";
import { useLanguage } from "../lib/language-context";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Sparkles,
      titleKey: "features.independentReviews.title",
      descriptionKey: "features.independentReviews.description",
      color: "bg-blue-500",
      shadow: "shadow-blue-500/40",
    },
    {
      icon: Shield,
      titleKey: "features.expertTested.title",
      descriptionKey: "features.expertTested.description",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-500/40",
    },
    {
      icon: Star,
      titleKey: "features.editorsChoice.title",
      descriptionKey: "features.editorsChoice.description",
      color: "bg-violet-500",
      shadow: "shadow-violet-500/40",
    },
    {
      icon: BookOpen,
      titleKey: "features.detailedGuides.title",
      descriptionKey: "features.detailedGuides.description",
      color: "bg-amber-500",
      shadow: "shadow-amber-500/40",
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className={`${feature.color} ${feature.shadow} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(feature.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

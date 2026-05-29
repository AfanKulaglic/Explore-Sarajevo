"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { useLanguage } from "../lib/language-context";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6">
              <Quote className="w-4 h-4" />
              {t("cta.badge")}
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t("cta.title1")}
              <span className="block text-white/80">{t("cta.title2")}</span>
            </h2>

            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-lg">
              {t("cta.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white text-violet-600 font-semibold rounded-2xl hover:bg-gray-100 hover:shadow-xl transition-all"
              >
                {t("cta.readArticles")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
              >
                {t("cta.learnMore")}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 mt-12 pt-8 border-t border-white/20">
              {[
                { value: "10K+", label: t("cta.stats.readers") },
                { value: "200+", label: t("cta.stats.reviews") },
                { value: "98%", label: t("cta.stats.accuracy") },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="space-y-4">
              {[
                {
                  name: t("cta.testimonials.testimonial1.name"),
                  role: t("cta.testimonials.testimonial1.role"),
                  content: t("cta.testimonials.testimonial1.content"),
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                },
                {
                  name: t("cta.testimonials.testimonial2.name"),
                  role: t("cta.testimonials.testimonial2.role"),
                  content: t("cta.testimonials.testimonial2.content"),
                  avatar: "/assets/covjek.png",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <p className="text-white/90 mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

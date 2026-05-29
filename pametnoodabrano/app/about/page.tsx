"use client";

import React from "react";
import { Zap, Target, Users, Sparkles } from "lucide-react";
import { useLanguage } from "../lib/language-context";

export default function ONamaPage() {
  const { t } = useLanguage();

  const categories = [
    { icon: "🎧", key: "audio" },
    { icon: "📱", key: "phones" },
    { icon: "💻", key: "laptops" },
    { icon: "🏠", key: "smartHome" },
    { icon: "⌚", key: "wearables" },
    { icon: "🎮", key: "gaming" },
    { icon: "📷", key: "cameras" },
    { icon: "🖥️", key: "monitors" },
    { icon: "⌨️", key: "peripherals" },
    { icon: "🔌", key: "chargers" },
    { icon: "🎒", key: "accessories" },
    { icon: "🤖", key: "aiGadgets" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-900 text-white py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("aboutPage.title")}</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            {t("aboutPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-16">
        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t("aboutPage.ourMission")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("aboutPage.missionP1")}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("aboutPage.missionP2")}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t("aboutPage.missionP3")}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-10 text-white">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
                <div className="text-violet-200">{t("aboutPage.stats.reviews")}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
                <div className="text-violet-200">{t("aboutPage.stats.categories")}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-violet-200">{t("aboutPage.stats.brands")}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-violet-200">{t("aboutPage.stats.readers")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            {t("aboutPage.ourValues")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("aboutPage.objectivity")}</h3>
              <p className="text-gray-600 text-sm">
                {t("aboutPage.objectivityDesc")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("aboutPage.thoroughness")}</h3>
              <p className="text-gray-600 text-sm">
                {t("aboutPage.thoroughnessDesc")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("aboutPage.community")}</h3>
              <p className="text-gray-600 text-sm">
                {t("aboutPage.communityDesc")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("aboutPage.innovation")}</h3>
              <p className="text-gray-600 text-sm">
                {t("aboutPage.innovationDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* About Saraya Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t("aboutPage.aboutSaraya")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("aboutPage.aboutSarayaP1")}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("aboutPage.aboutSarayaP2")}
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              {t("aboutPage.aboutSarayaP3")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-300"
              >
                {t("aboutPage.contactUs")}
              </a>
              <a
                href="mailto:info@sarayasolutions.com"
                className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                info@sarayasolutions.com
              </a>
            </div>
          </div>
        </div>

        {/* What We Cover Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            {t("aboutPage.whatWeCover")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.key}
                className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700">
                  {t(`aboutPage.coverCategories.${category.key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t("aboutPage.questionsTitle")}
          </h2>
          <p className="text-violet-100 mb-8 max-w-2xl mx-auto">
            {t("aboutPage.questionsDesc")}
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300"
          >
            {t("aboutPage.contactUs")}
          </a>
        </div>
      </section>
    </div>
  );
}

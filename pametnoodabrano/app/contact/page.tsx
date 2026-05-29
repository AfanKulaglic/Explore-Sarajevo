"use client";

import React from "react";
import { Mail, MapPin, MessageCircle, Lightbulb, Users, Star, Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import { useLanguage } from "../lib/language-context";

export default function KontaktPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-900 text-white py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("contactPage.title")}</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            {t("contactPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Card - Email CTA */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t("contactPage.writeUs")}
                </h2>
                <p className="text-gray-500">{t("contactPage.responseTime")}</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {t("contactPage.writeDescription")}
            </p>

            <a 
              href="mailto:marketing@sarayasolutions.com"
              className="inline-flex items-center gap-3 w-full justify-center py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 text-lg"
            >
              <Mail className="w-5 h-5" />
              marketing@sarayasolutions.com
            </a>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">{t("contactPage.inquiryTypes")}</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-600">
                  <Lightbulb className="w-5 h-5 text-violet-500" />
                  {t("contactPage.reviewSuggestions")}
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5 text-violet-500" />
                  {t("contactPage.businessPartnerships")}
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <MessageCircle className="w-5 h-5 text-violet-500" />
                  {t("contactPage.generalQuestions")}
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Star className="w-5 h-5 text-violet-500" />
                  {t("contactPage.marketingPromotions")}
                </li>
              </ul>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {t("contactPage.contactInfo")}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t("contactPage.email")}</h3>
                    <a href="mailto:marketing@sarayasolutions.com" className="text-violet-600 hover:underline">
                      marketing@sarayasolutions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t("contactPage.address")}</h3>
                    <p className="text-gray-600">
                      Terezije bb<br />
                      71000 Sarajevo<br />
                      Bosna i Hercegovina
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-10 text-white">
              <h2 className="text-2xl font-bold mb-4">{t("contactPage.aboutPametno")}</h2>
              <p className="text-violet-100 leading-relaxed mb-4">
                {t("contactPage.aboutPametnoDesc")}
              </p>
              <p className="text-violet-100 leading-relaxed">
                {t("contactPage.developedBy")} <span className="font-semibold text-white">Saraya Solutions</span> {t("contactPage.fromSarajevo")}
              </p>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("contactPage.followUs")}</h2>
              <p className="text-gray-600 mb-6">
                {t("contactPage.followUsDesc")}
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61583431934006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors text-gray-700"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com/sarayasolutions_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors text-gray-700"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://youtube.com/@sarayasolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors text-gray-700"
                >
                  <Youtube className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@sarayasolutions0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors text-gray-700"
                >
                  <Music2 className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

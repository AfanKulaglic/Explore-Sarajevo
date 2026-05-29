"use client";

import React from "react";
import { useLanguage } from "../lib/language-context";

export default function KolaciciPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-900 text-white py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("cookiesPage.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {t("cookiesPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-10">
        {/* Šta su kolačići */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s1Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("cookiesPage.s1P1")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("cookiesPage.s1P2")}
          </p>
        </div>

        {/* Koje kolačiće koristimo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s2Title")}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("cookiesPage.essentialTitle")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t("cookiesPage.essentialDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("cookiesPage.analyticsTitle")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t("cookiesPage.analyticsDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("cookiesPage.functionalTitle")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t("cookiesPage.functionalDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("cookiesPage.thirdPartyTitle")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t("cookiesPage.thirdPartyDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Kako upravljati kolačićima */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s3Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("cookiesPage.s3Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>{t("cookiesPage.browserChrome")}</li>
            <li>{t("cookiesPage.browserFirefox")}</li>
            <li>{t("cookiesPage.browserSafari")}</li>
            <li>{t("cookiesPage.browserEdge")}</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            {t("cookiesPage.s3Footer")}
          </p>
        </div>

        {/* Koliko dugo čuvamo kolačiće */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s4Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("cookiesPage.s4Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>{t("cookiesPage.sessionCookies")}</li>
            <li>{t("cookiesPage.persistentCookies")}</li>
          </ul>
        </div>

        {/* Izmjene politike */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s5Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t("cookiesPage.s5Desc")}
          </p>
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("cookiesPage.s6Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t("cookiesPage.s6Desc")}{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-violet-600 hover:underline">
              info@sarayasolutions.com
            </a>
          </p>
        </div>

        {/* Posljednja izmjena */}
        <div className="text-center text-gray-500 text-sm">
          <p>{t("cookiesPage.lastModified")}</p>
        </div>
      </section>
    </div>
  );
}

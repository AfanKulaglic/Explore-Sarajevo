"use client";

import React from "react";
import { useLanguage } from "../lib/language-context";

export default function UsloviKoristenjaPage() {
  const { t, tArray } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-900 text-white py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("termsPage.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {t("termsPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-10">
        {/* Prihvaćanje uslova */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s1Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s1P1")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s1P2")}
          </p>
        </div>

        {/* Šta je Pametno Odabrano */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s2Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s2Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("termsPage.s2Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s2Footer")}
          </p>
        </div>

        {/* Korištenje platforme */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s3Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s3Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("termsPage.s3Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Sadržaj na platformi */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s4Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s4P1")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("termsPage.s4Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s4P2")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s4P3")}
          </p>
        </div>

        {/* Intelektualna svojina */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s5Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s5P1")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s5P2")}
          </p>
        </div>

        {/* Ograničenje odgovornosti */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s6Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("termsPage.s6P1")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s6P2")}
          </p>
        </div>

        {/* Izmjene uslova */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s7Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s7Desc")}
          </p>
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("termsPage.s8Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t("termsPage.s8Desc")}{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-violet-600 hover:underline">
              info@sarayasolutions.com
            </a>
          </p>
        </div>

        {/* Posljednja izmjena */}
        <div className="text-center text-gray-500 text-sm">
          <p>{t("termsPage.lastModified")}</p>
        </div>
      </section>
    </div>
  );
}

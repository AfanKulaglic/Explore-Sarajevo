"use client";

import React from "react";
import { useLanguage } from "../lib/language-context";

export default function PolitikaPrivatnostiPage() {
  const { t, tArray } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-gray-900 text-white py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("privacyPage.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {t("privacyPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-10">
        {/* Uvod */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s1Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("privacyPage.s1P1")}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t("privacyPage.s1P2")}
          </p>
        </div>

        {/* Koje podatke prikupljamo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s2Title")}
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("privacyPage.s2aTitle")}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            {t("privacyPage.s2aDesc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("privacyPage.s2aItems").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("privacyPage.s2bTitle")}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            {t("privacyPage.s2bDesc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("privacyPage.s2bItems").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-gray-700 leading-relaxed">
            {t("privacyPage.s2bFooter")}
          </p>
        </div>

        {/* Kako koristimo podatke */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s3Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("privacyPage.s3Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("privacyPage.s3Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-gray-700 leading-relaxed">
            {t("privacyPage.s3Footer")}
          </p>
        </div>

        {/* Pravni osnov */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s4Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            {t("privacyPage.s4Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("privacyPage.s4Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Vaša prava */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s5Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t("privacyPage.s5Desc")}
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            {tArray("privacyPage.s5Items").map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-gray-700 leading-relaxed">
            {t("privacyPage.s5Footer")}{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-violet-600 hover:underline">
              info@sarayasolutions.com
            </a>
          </p>
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("privacyPage.s6Title")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t("privacyPage.s6Desc")}{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-violet-600 hover:underline">
              info@sarayasolutions.com
            </a>
          </p>
        </div>

        {/* Posljednja izmjena */}
        <div className="text-center text-gray-500 text-sm">
          <p>{t("privacyPage.lastModified")}</p>
        </div>
      </section>
    </div>
  );
}

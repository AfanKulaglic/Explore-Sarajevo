"use client";

import { useLanguage } from "../lib/language-context";

interface ProductsPageHeaderProps {
  children?: React.ReactNode;
}

export function ProductsPageHeader() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t("products.pageTitle")}
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {t("products.pageDescription")}
        </p>
      </div>
    </section>
  );
}

export function CategoriesPageHeader() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t("categories.pageTitle")}
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {t("categories.description")}
        </p>
      </div>
    </section>
  );
}

export function BrandsPageHeader() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t("brands.pageTitle")}
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {t("brands.pageDescription")}
        </p>
      </div>
    </section>
  );
}

export function FeaturedBrandHeader() {
  const { t } = useLanguage();

  return (
    <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("brands.featuredBrand")}</h2>
  );
}

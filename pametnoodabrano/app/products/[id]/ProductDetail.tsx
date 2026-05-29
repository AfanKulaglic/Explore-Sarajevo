"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Clock, User, Share2, Bookmark, BookmarkCheck, ChevronRight, Check, Images, Coins, Loader2 } from "lucide-react";
import { Item } from "../../lib/types";
import ProductCard from "../../components/ProductCard";
import Lightbox from "../../components/Lightbox";
import { useLanguage, useLocalizedContent } from "../../lib/language-context";
import ArticleRewardButton from "../../components/ArticleRewardButton";

interface ProductDetailProps {
  product: Item;
  relatedProducts: Item[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { language, t } = useLanguage();
  const { getLocalizedField, getLocalizedArray } = useLocalizedContent();
  
  // Article slug for reward tracking
  const articleSlug = product.slug || product.id;
  
  // Get localized content from CMS
  const title = getLocalizedField(product, 'title');
  const shortDescription = getLocalizedField(product, 'short_description');
  const longDescription = getLocalizedField(product, 'long_description');
  const imageAlt = getLocalizedField(product, 'image_alt') || getLocalizedField(product.image, 'alt') || title;
  const ctaText = getLocalizedField(product, 'cta_text');
  const keyFeatures = getLocalizedArray(product, 'key_features');
  const badges = getLocalizedArray(product, 'badges');
  const categoryName = getLocalizedField(product, 'category');
  
  const readTime = Math.max(3, Math.ceil((longDescription?.length || 200) / 200));
  const publishDate = product.published_at 
    ? new Date(product.published_at).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })
    : language === 'en' ? 'December 15, 2025' : '15. decembar 2025';

  // Translations for product detail page
  const pd = {
    home: language === 'en' ? 'Home' : 'Početna',
    articles: language === 'en' ? 'Articles' : 'Članci',
    minRead: language === 'en' ? 'min read' : 'min čitanja',
    rating: language === 'en' ? 'rating' : 'ocjena',
    clickToZoom: language === 'en' ? 'Click to zoom' : 'Klikni za uvećanje',
    allImages: language === 'en' ? 'All images' : 'Sve slike',
    main: language === 'en' ? 'Main' : 'Glavna',
    copied: language === 'en' ? 'Copied!' : 'Kopirano!',
    share: language === 'en' ? 'Share:' : 'Podijeli:',
    whyRecommend: language === 'en' ? 'Why we recommend' : 'Zašto preporučujemo',
    specifications: language === 'en' ? 'Technical specifications' : 'Tehničke specifikacije',
    authorDesc: language === 'en' 
      ? 'Our team of tech enthusiasts and experts is dedicated to finding and recommending the best products on the market. Every article is the result of thorough research and practical testing.'
      : 'Naš tim tehnoloških entuzijasta i stručnjaka posvećen je pronalaženju i preporučivanju najboljih proizvoda na tržištu. Svaki članak je rezultat temeljitog istraživanja i praktičnog testiranja.',
    tags: language === 'en' ? 'Tags:' : 'Tagovi:',
    relatedArticles: language === 'en' ? 'Related articles' : 'Slični članci',
    allArticles: language === 'en' ? 'All articles' : 'Svi članci',
    sarayaEditorial: language === 'en' ? 'Saraya Editorial' : 'Saraya Uredništvo',
    techEditor: language === 'en' ? 'Tech Editor' : 'Tech Editor',
  };

  // Combine main image + gallery for lightbox (all images)
  const galleryImages = Array.isArray(product.gallery) ? product.gallery : [];
  const allImages = [product.image.url, ...galleryImages].filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // TODO: Bookmark functionality - commented out for later implementation
  // const [isBookmarked, setIsBookmarked] = useState(false);

  // useEffect(() => {
  //   const bookmarks = JSON.parse(localStorage.getItem('saraya-bookmarks') || '[]');
  //   setIsBookmarked(bookmarks.some((b: { id: string }) => b.id === product.id));
  // }, [product.id]);

  // const handleBookmark = () => {
  //   const bookmarks = JSON.parse(localStorage.getItem('saraya-bookmarks') || '[]');
  //   
  //   if (isBookmarked) {
  //     // Remove from bookmarks
  //     const filtered = bookmarks.filter((b: { id: string }) => b.id !== product.id);
  //     localStorage.setItem('saraya-bookmarks', JSON.stringify(filtered));
  //     setIsBookmarked(false);
  //   } else {
  //     // Add to bookmarks
  //     const bookmark = {
  //       id: product.id,
  //       title: product.title,
  //       image: product.image,
  //       category: product.category,
  //       short_description: product.short_description,
  //       savedAt: new Date().toISOString()
  //     };
  //     bookmarks.push(bookmark);
  //     localStorage.setItem('saraya-bookmarks', JSON.stringify(bookmarks));
  //     setIsBookmarked(true);
  //   }
  // };

  return (
    <article className="pt-20 lg:pt-28">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              {pd.home}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-white transition-colors">
              {pd.articles}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-violet-400">{categoryName}</span>
          </nav>

          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <span className="px-4 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm font-medium">
              {categoryName}
            </span>
            {badges?.map((badge) => (
              <span
                key={badge}
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  badge === "Urednički izbor" || badge === "Editor's Choice"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {badge}
              </span>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl"
          >
            {shortDescription}
          </motion.p>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{pd.sarayaEditorial}</p>
                <p className="text-xs text-gray-500">{pd.techEditor}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime} {pd.minRead}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>{publishDate}</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white font-medium">{(product.ranking_score || 4.5).toFixed(1)}</span>
                <span className="text-gray-500">{pd.rating}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="relative mt-8 mb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/30 cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/50 px-4 py-2 rounded-full text-sm">
                {pd.clickToZoom}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Gallery Section */}
      {allImages.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Images className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">{pd.allImages} ({allImages.length})</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={img}
                    alt={`${product.title} - slika ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded">
                      {pd.main}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={title}
      />

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Share Bar */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{copied ? pd.copied : pd.share}</span>
            <button 
              onClick={handleShare}
              className={`p-2 rounded-full transition-colors ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
          {/* TODO: Sačuvaj button - commented out for later implementation
          <button 
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isBookmarked ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            <span className="text-sm font-medium">{isBookmarked ? 'Sačuvano' : 'Sačuvaj'}</span>
          </button>
          */}
        </div>

        {/* Article Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-lg prose-gray max-w-none"
        >
          {/* Introduction - Short Description */}
          {shortDescription && (
            <p className="text-xl text-gray-700 leading-relaxed mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-violet-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              {shortDescription}
            </p>
          )}

          {/* Key Highlights Section */}
          {keyFeatures && keyFeatures.length > 0 && (
            <div className="my-8 sm:my-12 p-6 sm:p-8 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </span>
                {pd.whyRecommend}
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 sm:gap-4">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5 sm:pt-1 text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Article Content */}
          {longDescription && (
            <div 
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed mb-6 mt-8"
              dangerouslySetInnerHTML={{ __html: longDescription }}
            />
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-12 mb-6">{pd.specifications}</h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[300px]">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 capitalize border-r border-gray-200 whitespace-nowrap">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* Author Box */}
        <div className="mt-16 p-6 sm:p-8 bg-gray-50 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{pd.sarayaEditorial}</h4>
              <p className="text-sm text-violet-600 mb-3">{pd.techEditor}</p>
              <p className="text-gray-600 text-sm">
                {pd.authorDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{pd.tags}</span>
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Reward Button */}
        <ArticleRewardButton articleSlug={articleSlug} language={language} />
      </div>

      {/* Related Articles */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{pd.relatedArticles}</h2>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-violet-600 font-medium hover:gap-3 transition-all"
              >
                {pd.allArticles}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language-context";

const Footer = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  // Hide footer on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo i opis */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/assets/sarayalogoicon.png"
                  alt="Saraya Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-semibold text-lg text-white">{t("common.siteName")}</span>
                <span className="block text-xs text-gray-400">{t("common.tagline")}</span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t("footer.description")}
            </p>

            {/* Društvene mreže */}
            <div className="flex items-center gap-4 mt-5">
              <a
                href="https://www.facebook.com/profile.php?id=61583431934006"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/sarayasolutions_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@sarayasolutions?si=hE_sBiTLa52EJ7yo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a
                href="https://www.tiktok.com/@sarayasolutions0?_r=1&_t=ZM-92U633z9RrE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Music2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Saraya Apps */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              {t("footer.sarayaApps")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <a href="https://hs.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  Saraya Connect
                </a>
              </li>
              <li>
                <a href="https://rewards.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  Rewards Center
                </a>
              </li>
              <li>
                <a href="https://quiz.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  Quiz
                </a>
              </li>
              <li>
                <a href="https://saraya.games/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  Play & Win
                </a>
              </li>
              <li>
                <a href="https://bihdiscovery.com/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  Explore Sarajevo
                </a>
              </li>
            </ul>
          </div>

          {/* Pomoć */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              {t("footer.help")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/contact" className="hover:text-violet-400 transition">
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-violet-400 transition">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                  {t("footer.sarayaSolutions")}
                </a>
              </li>
            </ul>
          </div>

          {/* Pravne informacije */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/privacy" className="hover:text-violet-400 transition">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-violet-400 transition">
                  {t("footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-violet-400 transition">
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Donji red */}
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2025 Saraya Solutions. {t("footer.copyright")}</p>
          <p className="mt-3 sm:mt-0">
            {t("footer.designDevelopment")}{" "}
            <a
              href="https://sarayasolutions.com/"
              target="_blank"
              className="text-gray-300 hover:text-violet-400 transition"
            >
              Saraya Team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

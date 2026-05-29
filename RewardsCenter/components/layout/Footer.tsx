'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

const Footer = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Hide footer on auth and admin pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-950/80 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/sarayalogoicon.png"
                  alt="Saraya Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-semibold text-lg text-white">Saraya</span>
                <span className="block text-xs text-white/50">{t.footer.rewardsCenter}</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              {t.footer.tagline}
            </p>

            {/* Social media */}
            <div className="flex items-center gap-4 mt-5">
              <a
                href="https://www.facebook.com/profile.php?id=61583431934006"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/sarayasolutions_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@sarayasolutions?si=hE_sBiTLa52EJ7yo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a
                href="https://www.tiktok.com/@sarayasolutions0?_r=1&_t=ZM-92U633z9RrE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition"
              >
                <Music2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Saraya Apps */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              Saraya Apps
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a href="https://hs.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  Saraya Connect
                </a>
              </li>
              <li>
                <a href="https://quiz.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  Quiz
                </a>
              </li>
              <li>
                <a href="https://saraya.games/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  Play & Win
                </a>
              </li>
              <li>
                <a href="https://bihdiscovery.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  Explore Sarajevo
                </a>
              </li>
              <li>
                <a href="https://pametnoodabrano.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  Pametno Odabrano
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              {t.footer.help}
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/support" className="hover:text-brand-400 transition">
                  {t.footer.supportCenter}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition">
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition">
                  {t.footer.sarayaSolutions}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white text-base mb-4">
              {t.footer.legal}
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/privacy" className="hover:text-brand-400 transition">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-400 transition">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-brand-400 transition">
                  {t.footer.cookiePolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2025 Saraya Solutions. {t.footer.allRightsReserved}</p>
          <p className="mt-3 sm:mt-0">
            Design & Development:{" "}
            <a
              href="https://sarayasolutions.com/"
              target="_blank"
              className="text-white/60 hover:text-brand-400 transition"
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

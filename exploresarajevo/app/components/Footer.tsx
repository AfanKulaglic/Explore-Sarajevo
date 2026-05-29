"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Music2, Youtube, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "../lib/language-context";

const Footer = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname.startsWith("/auth")) return null;

  return (
    <footer style={{ background: '#07070f', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mb-8">

          {/* Brand */}
          <div className="lg:col-span-5">
            <Image
              src="/assets/exploreSarajevo-logo1.png"
              alt="Explore Sarajevo"
              width={180} height={60}
              className="h-10 md:h-12 w-auto object-contain mb-5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-[#a0a0b8] text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <SocialIcon href="https://www.facebook.com/profile.php?id=61583431934006" icon={<Facebook className="w-4 h-4" />} />
              <SocialIcon href="https://www.instagram.com/sarayasolutions_/"           icon={<Instagram className="w-4 h-4" />} />
              <SocialIcon href="https://youtube.com/@sarayasolutions?si=hE_sBiTLa52EJ7yo" icon={<Youtube className="w-4 h-4" />} />
              <SocialIcon href="https://www.tiktok.com/@sarayasolutions0?_r=1&_t=ZM-92U633z9RrE" icon={<Music2 className="w-4 h-4" />} />
            </div>
          </div>

          {/* Saraya Apps */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#7c3aed] font-bold mb-5">Saraya Apps</h3>
            <ul className="space-y-3 text-sm">
              <FooterExtLink href="https://hs.saraya.solutions/">Saraya Connect</FooterExtLink>
              <FooterExtLink href="https://rewards.saraya.solutions/">Rewards Center</FooterExtLink>
              <FooterExtLink href="https://quiz.saraya.solutions/">Saraya Quiz</FooterExtLink>
              <FooterExtLink href="https://saraya.games/">Play & Win</FooterExtLink>
              <FooterExtLink href="https://pametnoodabrano.com/">Pametno Odabrano</FooterExtLink>
            </ul>
          </div>

          {/* Help */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#7c3aed] font-bold mb-5">{t('footer.help')}</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/contact">{t('footer.contact')}</FooterLink>
              <FooterLink href="/o-nama">{t('footer.aboutUs')}</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#7c3aed] font-bold mb-5">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/privacy">{t('footer.privacyPolicy')}</FooterLink>
              <FooterLink href="/terms">{t('footer.termsOfUse')}</FooterLink>
              <FooterLink href="/cookies">{t('footer.cookies')}</FooterLink>
            </ul>
          </div>
        </div>

        {/* Saraya Solutions CTA row */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 py-7 my-7"
          style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--violet)' }}
            >
              S
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a72] font-bold">Made by</p>
              <a
                href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
                className="text-base font-semibold text-white hover:text-[#a78bfa] transition flex items-center gap-1"
              >
                Saraya Solutions <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <a
            href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition"
            style={{ background: 'var(--violet)' }}
          >
            Visit sarayasolutions.com <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5a5a72]">
          <p>© 2025 Saraya Solutions. {t('footer.allRightsReserved')}</p>
          <p>
            {t('footer.designDevelopment')}:{' '}
            <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
              className="text-[#a0a0b8] hover:text-[#a78bfa] transition">
              Saraya Team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="w-10 h-10 rounded-full flex items-center justify-center text-[#a0a0b8] hover:text-white transition"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[#a0a0b8] hover:text-[#a78bfa] transition">{children}</Link>
    </li>
  );
}

function FooterExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="text-[#a0a0b8] hover:text-[#a78bfa] transition flex items-center gap-1.5 group">
        {children}
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </li>
  );
}

export default Footer;

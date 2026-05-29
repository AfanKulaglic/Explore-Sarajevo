"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Building2, CalendarDays, ArrowUpRight } from "lucide-react";
import { useTranslation } from "../lib/language-context";

export default function ONamaPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative w-full h-[50vh] min-h-[360px] overflow-hidden">
        <Image src="/assets/panoramaSarajevoDan.jpg" alt="Sarajevo" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,15,0.6) 0%, rgba(9,9,15,0.95) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(124,58,237,0.15) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 flex items-end pb-10 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ A Note from the Editors</span>
            <h1 className="mt-4 text-white text-3xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight max-w-4xl">{t("about.pageTitle")}</h1>
            <p className="mt-5 text-[#a0a0b8] text-sm max-w-xl">{t("about.pageSubtitle")}</p>
          </div>
        </div>
      </section>

      {/* Lead */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-xl md:text-4xl text-white font-bold leading-[1.1] mb-6">{t("about.welcome")}</h2>
          <div className="space-y-5 text-[#a0a0b8] text-sm md:text-base leading-relaxed">
            <p>{t("about.description1")}</p>
            <p>{t("about.description2")}</p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            ["01", <Compass className="w-5 h-5" />, t("about.features.locations"), t("about.features.locationsDesc")],
            ["02", <Building2 className="w-5 h-5" />, t("about.features.businesses"), t("about.features.businessesDesc")],
            ["03", <CalendarDays className="w-5 h-5" />, t("about.features.events"), t("about.features.eventsDesc")],
          ].map(([num, icon, title, text]) => (
            <article key={String(num)} className="rounded-2xl p-4 md:p-7 transition group"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-[#7c3aed] text-3xl tabular-nums font-bold">№ {num}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#a78bfa]"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {icon}
                </div>
              </div>
              <h3 className="text-lg text-white font-bold mb-2 leading-tight">{String(title)}</h3>
              <p className="text-[#a0a0b8] leading-relaxed text-sm">{String(text)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-3xl md:text-5xl text-white font-bold leading-[1.15] tracking-tight mb-8">
            "We believe a good guide doesn't just tell you{' '}
            <span className="gradient-text">where to go</span> — it tells you why a place is worth your time."
          </p>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a72] font-bold mb-2">Made by</div>
          <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-2xl text-[#a78bfa] hover:text-[#c4b5fd] transition font-bold">
            Saraya Solutions <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="text-4xl md:text-5xl text-white font-bold mb-4">Have questions?</h2>
        <p className="text-[#a0a0b8] text-lg mb-8 max-w-xl mx-auto">Whether you run a business, organize events, or just want to say hello — we'd love to hear from you.</p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition shadow-xl"
          style={{ background: 'var(--violet)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
          Get in touch <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

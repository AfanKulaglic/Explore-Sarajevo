"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/language-context";

export default function StoryBand() {
  const { t } = useTranslation();

  return (
    <section className="relative py-12 md:py-24 px-4 md:px-8 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Violet glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none -translate-y-1/2"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="md:col-span-7 relative"
          >
            <div className="relative h-[280px] md:h-[500px] rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}>
              <Image src="/assets/carsija.jpg" alt="Sarajevo Baščaršija" fill
                sizes="(min-width: 768px) 60vw, 100vw" className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090f]/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 md:p-6">
                <span className="text-[#a0a0b8] text-[10px] uppercase tracking-[0.3em] font-bold">Photograph · Baščaršija</span>
              </div>
            </div>
            <div className="absolute -bottom-4 left-4 md:left-6 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg"
              style={{ background: 'var(--violet)' }}>
              An essay by Saraya
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-5"
          >
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Mission · Notes</span>
            <h2 className="mt-4 text-2xl md:text-4xl text-white font-bold tracking-tight leading-[1.05]">
              {t("sections.ourMission")}
            </h2>
            <div className="mt-6 space-y-4 text-[#a0a0b8] text-base md:text-lg leading-relaxed">
              <p>{t("sections.ourMissionText")}</p>
              <p className="text-[#a0a0b8] pl-4" style={{ borderLeft: '2px solid var(--violet)' }}>
                {t("sections.ourPlaceText")}
              </p>
            </div>
            <div className="mt-8 pt-8 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: 'var(--violet)' }}>S</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a5a72] font-semibold">Words from</p>
                <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-[#a78bfa] transition">
                  Saraya Solutions →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

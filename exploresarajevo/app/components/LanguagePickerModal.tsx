"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "../lib/language-context";
import type { Language } from "../lib/language-context";

const STORAGE_KEY = "es_language_chosen";

export default function LanguagePickerModal() {
  const { setLanguage } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't chosen a language before
    try {
      const chosen = localStorage.getItem(STORAGE_KEY);
      if (!chosen) setVisible(true);
    } catch {
      // localStorage unavailable — skip
    }
  }, []);

  const choose = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    setVisible(false);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — very light, non-blocking feel */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(9,9,15,0.55)", backdropFilter: "blur(6px)" }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.05 }}
            className="fixed inset-0 z-[201] flex items-center justify-center px-4"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(124,58,237,0.25)",
                boxShadow: "0 0 60px rgba(124,58,237,0.15), 0 32px 64px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top — logo + headline */}
              <div
                className="px-7 pt-8 pb-6 text-center"
                style={{
                  background: "linear-gradient(160deg, rgba(124,58,237,0.12) 0%, transparent 60%)",
                  borderBottom: "1px solid rgba(124,58,237,0.12)",
                }}
              >
                <Image
                  src="/assets/exploreSarajevo-logo1.png"
                  alt="Explore Sarajevo"
                  width={160}
                  height={48}
                  className="mx-auto mb-5 h-9 w-auto object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />

                <h2 className="text-white text-xl font-bold leading-tight mb-1">
                  Choose your language
                </h2>
                <p className="text-[#a0a0b8] text-sm">
                  Odaberite jezik / Select language
                </p>
              </div>

              {/* Language options */}
              <div className="p-5 flex flex-col gap-3">
                <LangButton
                  flagCode="ba"
                  label="Bosanski"
                  sublabel="Bosanski jezik"
                  onClick={() => choose("bs")}
                />
                <LangButton
                  flagCode="gb"
                  label="English"
                  sublabel="English language"
                  onClick={() => choose("en")}
                />
              </div>

              {/* Dismiss link */}
              <div className="px-5 pb-6 text-center">
                <button
                  onClick={dismiss}
                  className="text-[#5a5a72] text-xs hover:text-[#a0a0b8] transition-colors"
                >
                  Continue without choosing
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LangButton({
  flagCode,
  label,
  sublabel,
  onClick,
}: {
  flagCode: string;   // ISO 3166-1 alpha-2 lowercase, e.g. "ba", "gb"
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
        e.currentTarget.style.background = "rgba(124,58,237,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--bg-raised)";
      }}
    >
      {/* Flag — SVG from flagcdn.com, consistent on all OS/browsers */}
      <div className="w-10 h-7 rounded-md overflow-hidden shrink-0 shadow-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <img
          src={`https://flagcdn.com/w80/${flagCode}.png`}
          srcSet={`https://flagcdn.com/w160/${flagCode}.png 2x`}
          alt={label}
          width={40}
          height={28}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-base leading-tight group-hover:text-[#a78bfa] transition-colors">
          {label}
        </p>
        <p className="text-[#5a5a72] text-xs mt-0.5">{sublabel}</p>
      </div>

      {/* Arrow */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "var(--violet)" }}
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

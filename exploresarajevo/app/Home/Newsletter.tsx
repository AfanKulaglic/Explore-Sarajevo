"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="relative py-12 md:py-24 px-4 md:px-8 overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      {/* Violet glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#a78bfa] text-[10px] font-bold uppercase tracking-[0.25em] mb-6"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Sparkles className="w-3 h-3" /> Saraya Solutions
          </div>

          <h2 className="text-2xl md:text-5xl text-white font-bold tracking-tight leading-[1.05] mb-6">
            Built with care in <br />
            <span className="gradient-text">Sarajevo</span>, for the world.
          </h2>

          <p className="text-[#a0a0b8] text-sm md:text-lg max-w-2xl mx-auto leading-relaxed mb-7">
            Explore Sarajevo is a project by Saraya Solutions — a digital studio crafting experiences
            that connect cities with the people who love them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white transition shadow-xl"
              style={{ background: 'var(--violet)', boxShadow: '0 0 30px rgba(124,58,237,0.35)' }}>
              Visit sarayasolutions.com <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide text-[#a0a0b8] hover:text-white transition"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
              Get in touch
            </a>
          </div>

          {/* Saraya Apps */}
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a72] font-bold mb-4">The Saraya Ecosystem</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {[
                ['Saraya Connect', 'https://hs.saraya.solutions/'],
                ['Rewards Center', 'https://rewards.saraya.solutions/'],
                ['Quiz', 'https://quiz.saraya.solutions/'],
                ['Play & Win', 'https://saraya.games/'],
                ['Pametno Odabrano', 'https://pametnoodabrano.com/'],
              ].map(([name, href], i, arr) => (
                <span key={name} className="flex items-center gap-6">
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-[#a0a0b8] hover:text-[#a78bfa] font-medium transition">{name}</a>
                  {i < arr.length - 1 && <span className="text-[#7c3aed] select-none">·</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

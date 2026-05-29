"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Clock, MessageCircle, Compass, Building2, Users, Facebook, Instagram, Youtube, Music2, ExternalLink } from "lucide-react";
import { useTranslation } from "../lib/language-context";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <Image src="/assets/panoramaSarajevoNoc.jpg" alt="Sarajevo" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,15,0.6) 0%, rgba(9,9,15,0.95) 100%)' }} />
        <div className="absolute inset-0 flex items-end pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Letterbox</span>
            <h1 className="mt-4 text-white text-3xl md:text-5xl font-bold leading-[0.95] tracking-tight">{t("contact.pageTitle")}</h1>
            <p className="mt-4 text-[#a0a0b8] text-sm max-w-xl">{t("contact.pageSubtitle")}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12">
          {/* Left */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h2 className="text-xl md:text-3xl text-white font-bold mb-3">Explore Sarajevo by Saraya Solutions</h2>
              <p className="text-[#a0a0b8] text-base md:text-lg leading-relaxed">{t("contact.description")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock icon={<Mail className="w-4 h-4" />} eyebrow={t("contact.email")}>
                <a href="mailto:marketing@sarayasolutions.com" className="text-[#a78bfa] hover:text-[#c4b5fd] font-semibold text-sm break-all transition">marketing@sarayasolutions.com</a>
              </InfoBlock>
              <InfoBlock icon={<MapPin className="w-4 h-4" />} eyebrow={t("contact.address")}>
                <p className="text-[#a0a0b8] text-sm leading-relaxed">Terezije bb, 71000<br />Sarajevo, Bosnia & Herzegovina</p>
              </InfoBlock>
              <InfoBlock icon={<Clock className="w-4 h-4" />} eyebrow={t("contact.workingHours")}>
                <p className="text-[#a0a0b8] text-sm leading-relaxed">Mon-Fri: 10:00 – 18:00<br /><span className="text-[#5a5a72]">Sat-Sun: closed</span></p>
              </InfoBlock>
              <InfoBlock icon={<Compass className="w-4 h-4" />} eyebrow="Studio">
                <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
                  className="text-[#a78bfa] hover:text-[#c4b5fd] font-semibold text-sm inline-flex items-center gap-1 transition">
                  sarayasolutions.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </InfoBlock>
            </div>
            {/* Map */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <MapPin className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72]">Find us</span>
              </div>
              <div className="w-full h-[360px] relative">
                <iframe src="https://www.google.com/maps?q=loc:43.8550654,18.4140267&z=17&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl p-7 md:p-9" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {/* Violet glow */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
              <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Write to us</span>
              <h3 className="mt-3 text-3xl md:text-4xl text-white font-bold leading-tight">Send a letter</h3>
              <p className="mt-3 text-[#a0a0b8] text-sm md:text-base leading-relaxed">For any questions, suggestions, or business inquiries — we read every email and reply within 24 hours.</p>
              <a href="mailto:marketing@sarayasolutions.com"
                className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold text-white transition"
                style={{ background: 'var(--violet)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                <Mail className="w-4 h-4" /> marketing@sarayasolutions.com
              </a>
              <div className="mt-7 pt-6 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a72] font-bold">We can help with</p>
                {[
                  [<Building2 className="w-4 h-4" />, "Adding your business to the directory"],
                  [<Compass className="w-4 h-4" />, "Suggesting new attractions or locations"],
                  [<Users className="w-4 h-4" />, "Partnerships and brand collaborations"],
                  [<MessageCircle className="w-4 h-4" />, "General questions and feedback"],
                ].map(([icon, text]) => (
                  <div key={String(text)} className="flex items-center gap-2.5 text-sm text-[#a0a0b8]">
                    <span className="text-[#7c3aed]">{icon}</span>{text}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#5a5a72] mb-4">{t("contact.followUs")}</p>
              <div className="flex items-center gap-3">
                {[
                  ["https://www.facebook.com/profile.php?id=61583431934006", <Facebook className="w-4 h-4" />],
                  ["https://www.instagram.com/sarayasolutions_/", <Instagram className="w-4 h-4" />],
                  ["https://youtube.com/@sarayasolutions", <Youtube className="w-4 h-4" />],
                  ["https://www.tiktok.com/@sarayasolutions0", <Music2 className="w-4 h-4" />],
                ].map(([href, icon]) => (
                  <a key={String(href)} href={String(href)} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#a0a0b8] hover:text-white transition"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoBlock({ icon, eyebrow, children }: { icon: React.ReactNode; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 text-[#7c3aed] mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72]">{eyebrow}</span>
      </div>
      {children}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string; subtitle?: string; eyebrow?: string;
  heroImage?: string; children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, eyebrow = "Legal · Notes", heroImage = "/assets/ExploreSarajevoBG.png", children }: Props) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative w-full h-[44vh] min-h-[340px] overflow-hidden">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,15,0.7) 0%, rgba(9,9,15,0.95) 100%)' }} />
        <div className="absolute inset-0 flex items-end pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[#a0a0b8] hover:text-[#a78bfa] text-xs uppercase tracking-[0.25em] font-bold mb-4 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ {eyebrow}</span>
            <h1 className="mt-3 text-white text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight max-w-3xl">{title}</h1>
            {subtitle && <p className="mt-3 text-[#a0a0b8] text-base md:text-lg max-w-xl">{subtitle}</p>}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-10">{children}</div>
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs text-[#5a5a72] uppercase tracking-[0.25em] font-bold">
            Saraya Solutions ·{' '}
            <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer" className="text-[#a0a0b8] hover:text-[#a78bfa] transition">sarayasolutions.com</a>
          </p>
          <Link href="/contact" className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] font-semibold transition">Have a question? Get in touch →</Link>
        </div>
      </section>
    </div>
  );
}

export function LegalSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <article>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[#7c3aed] text-2xl tabular-nums font-bold">{number}</span>
        <h2 className="text-2xl md:text-3xl text-white font-bold leading-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-[#a0a0b8] text-base leading-relaxed prose-saraya">{children}</div>
    </article>
  );
}

'use client';

import Link from 'next/link';

// Saraya Apps links (excluding current app - SarayaQuiz)
const SARAYA_APPS = [
  { name: 'Saraya Connect', href: 'https://hs.saraya.solutions/' },
  { name: 'Rewards Center', href: 'https://rewards.saraya.solutions/' },
  { name: 'Play & Win', href: 'https://saraya.games/' },
  { name: 'Explore Sarajevo', href: 'https://bihdiscovery.com/' },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/' },
];

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Saraya Apps */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-white mb-4 text-sm">Saraya Apps</h3>
            <ul className="space-y-2 text-sm">
              {SARAYA_APPS.map((app) => (
                <li key={app.name}>
                  <a
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition"
                  >
                    {app.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/60 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="https://sarayasolutions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition"
                >
                  Saraya Solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="font-semibold text-white mb-4 text-sm">Legal</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li>
                <a
                  href="https://sarayasolutions.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://sarayasolutions.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2025 Saraya Solutions. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Design & Development:{' '}
            <a
              href="https://sarayasolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition"
            >
              Saraya Team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

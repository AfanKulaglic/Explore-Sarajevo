'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone);

    setIsIos(ios);

    if (standalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:left-[calc(16rem+1rem)] lg:right-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-900 p-2 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Install Saraya CMS</p>
            <p className="mt-0.5 text-xs text-slate-500">Add to your home screen for quick access.</p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  await deferredPrompt.prompt();
                  setDeferredPrompt(null);
                  setDismissed(true);
                }}
              >
                Install
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setDismissed(true)}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isIos) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:left-[calc(16rem+1rem)] lg:right-4">
        <p className="text-sm font-semibold text-slate-900">Install on iPhone</p>
        <p className="mt-1 text-xs text-slate-500">
          Tap Share, then &ldquo;Add to Home Screen&rdquo;. Safari does not show a Chrome-style install button.
        </p>
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setDismissed(true)}>
          Got it
        </Button>
      </div>
    );
  }

  return null;
}

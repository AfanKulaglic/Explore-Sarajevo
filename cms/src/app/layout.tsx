import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Saraya CMS',
    template: '%s | Saraya CMS',
  },
  description: 'Content Management System za upravljanje Saraya platformama',
  metadataBase: new URL('https://cms.saraya.solutions'),
  applicationName: 'Saraya CMS',
  authors: [{ name: 'Saraya' }],
  generator: 'Next.js',
  keywords: ['CMS', 'Saraya', 'admin', 'dashboard'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Saraya CMS',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ServiceWorkerRegistration />
            <InstallPrompt />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

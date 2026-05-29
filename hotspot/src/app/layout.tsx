import type { Metadata } from 'next'
import './globals.css'
import { ContentProvider } from '@/context/ContentContext'
import { AuthProvider } from '@/context/AuthContext'
import { PageLoader } from '@/components/ui/PageLoader'
import { CompanyChat } from '@/components/CompanyChat/CompanyChat'
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  title: 'Saraya Connect | Free WiFi Portal',
  description: 'Welcome to Saraya Connect Free WiFi - explore exclusive offers, local discoveries, and more while connected.',
  applicationName: 'Saraya Connect',
  authors: [{ name: 'Saraya Solutions' }],
  keywords: ['Saraya Connect', 'Free WiFi', 'Sarajevo', 'WiFi Portal', 'Local Offers'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hs.saraya.solutions',
    siteName: 'Saraya Connect',
    title: 'Saraya Connect | Free WiFi Portal',
    description: 'Saraya Connect Free WiFi - explore exclusive offers, local discoveries, and games while connected. Saraya Connect platforms by Saraya.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Saraya Connect Free WiFi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saraya Connect | Free WiFi Portal',
    description: 'Saraya Connect Free WiFi - explore exclusive offers, local discoveries, and games while connected.',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://hs.saraya.solutions'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Critical CSS loader that works even if JS fails */}
        <style dangerouslySetInnerHTML={{ __html: `
          #css-fallback-loader {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0a0f;
            transition: opacity 0.3s ease-out;
          }
          #css-fallback-loader.hidden {
            opacity: 0;
            pointer-events: none;
          }
          #css-fallback-loader .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(139, 92, 246, 0.2);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          /* Hide the CSS loader once React hydrates */
          body.hydrated #css-fallback-loader {
            opacity: 0;
            pointer-events: none;
          }
        `}} />
        {/* Script to hide fallback loader once page is interactive */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Remove CSS fallback loader once JS is working
          (function() {
            function hideLoader() {
              document.body.classList.add('hydrated');
              var loader = document.getElementById('css-fallback-loader');
              if (loader) {
                loader.classList.add('hidden');
                setTimeout(function() { loader.remove(); }, 300);
              }
            }
            // Multiple triggers for reliability
            if (document.readyState === 'complete') {
              setTimeout(hideLoader, 100);
            } else {
              window.addEventListener('load', function() { setTimeout(hideLoader, 100); });
            }
            // Absolute fallback: 4 seconds max
            setTimeout(hideLoader, 4000);
          })();
        `}} />
      </head>
      <body className="bg-surface-dark min-h-screen antialiased">
        {/* CSS-only fallback loader (no JS dependency) */}
        <div id="css-fallback-loader">
          <div className="spinner"></div>
        </div>
        {/* Noscript fallback for no-JS users */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: `
            #css-fallback-loader { display: none !important; }
          `}} />
        </noscript>
        <PostHogProvider>
          <ContentProvider>
            <AuthProvider>
              <PageLoader />
              {children}
              <CompanyChat />
            </AuthProvider>
          </ContentProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

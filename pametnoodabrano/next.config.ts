import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "cheerio"],
  // Disable the client-side Router Cache so navigating between pages
  // always fetches a fresh server response (no stale RSC payloads)
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  images: {
    unoptimized: true, // Disable image optimization for faster loading of external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn.freebiesupply.com",
      },
      {
        protocol: "https",
        hostname: "1000logos.net",
      },
      {
        protocol: "https",
        hostname: "images.icon-icons.com",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
      {
        protocol: "https",
        hostname: "nkruunuuhlxlcctgwvmx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "saraya.deployer3000.halvooo.com",
      },
      {
        protocol: "https",
        hostname: "cms.saraya.solutions",
      },
    ],
  },
  env: {
    CMS_URL: process.env.CMS_URL || 'http://localhost:3003',
  },
};

export default nextConfig;

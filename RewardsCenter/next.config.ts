import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Remote SVG (Dicebear fallbacks) must not go through the image optimizer — it returns 400.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "saraya.deployer3000.halvooo.com",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "accounts.saraya.solutions",
      },
    ],
  },
};

export default nextConfig;

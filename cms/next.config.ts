import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/hotspot/deal-blokovi',
        destination: '/dashboard/hotspot/blokovi',
        permanent: true,
      },
    ];
  },

  // Enable static export if needed
  // output: 'standalone',
  
  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'saraya.deployer3000.halvooo.com',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // CORS headers for public API routes
  async headers() {
    return [
      {
        // Hotspot CMS APIs must never be cached (stale block sets / hero rows vs Supabase truth)
        source: '/api/hotspot/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Match all public API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;

declare module '@ducanh2912/next-pwa' {
  import type { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    scope?: string;
    sw?: string;
    workboxOptions?: {
      disableDevLogs?: boolean;
      [key: string]: unknown;
    };
    buildExcludes?: Array<string | RegExp>;
    publicExcludes?: string[];
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    [key: string]: unknown;
  }
  
  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}

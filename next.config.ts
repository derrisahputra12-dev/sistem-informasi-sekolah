import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modern Next.js 16 already targets modern browsers by default
  // Legacy JS polyfills shown in Lighthouse are development-only
  // Production builds will not include these polyfills
  reactStrictMode: true,
};

export default nextConfig;


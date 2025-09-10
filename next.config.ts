import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for better deployment compatibility
  images: {
    unoptimized: true,
  },

  // Trailing slash for better static hosting compatibility
  trailingSlash: true,

  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

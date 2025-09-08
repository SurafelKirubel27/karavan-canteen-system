import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for better deployment compatibility
  images: {
    unoptimized: true,
  },

  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable image optimization for better deployment compatibility
  images: {
    unoptimized: true,
  },

  // Output configuration
  output: 'standalone',
};

module.exports = nextConfig;

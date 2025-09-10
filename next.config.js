/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Completely disable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable image optimization
  images: {
    unoptimized: true,
  },

  // Experimental features to bypass checks
  experimental: {
    forceSwcTransforms: true,
  },

  // Webpack configuration to ignore warnings
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { file: /node_modules/ },
    ];
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configure webpack to properly handle caching
  webpack: (config) => {
    // Disable file system cache to prevent ENOENT errors
    config.cache = {
      type: 'memory'
    };
    return config;
  }
};

module.exports = nextConfig;
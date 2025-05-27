/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  trailingSlash: true,
  // 最简配置，避免任何可能的问题
  webpack: (config) => {
    // 完全禁用缓存
    config.cache = false;
    return config;
  },
  // 确保API路由正常工作
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
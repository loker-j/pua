/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  trailingSlash: true,
  // 为Netlify优化的webpack配置
  webpack: (config, { isServer }) => {
    // 在Netlify环境使用文件系统缓存，本地使用内存缓存
    if (process.env.NETLIFY) {
      config.cache = false; // 在Netlify上禁用缓存避免问题
    } else {
      config.cache = {
        type: 'memory'
      };
    }
    
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
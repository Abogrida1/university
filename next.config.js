/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // تحسينات الأداء
  compress: true,
  generateEtags: true,
  
  // Configure images for external domains
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Disable static optimization for dynamic routes
  trailingSlash: false,
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Output configuration for Render
  // output: 'standalone', // Commented out for Render compatibility
  
  // Asset prefix for Render
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Enable dynamic imports and performance optimizations
  webpack: (config, { dev, isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    
    // تحسين التطوير
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // تحسين الإنتاج
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config
  },
  
  // إعدادات الأمان والأداء
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Configure images for external domains
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com']
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
  
  // Enable dynamic imports
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  }
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove ppr which is not available in Next.js 14
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable telemetry
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint configuration  
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
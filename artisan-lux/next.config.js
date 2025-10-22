/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Output configuration for deployment
  output: 'standalone',
  // Disable ESLint during build (warnings won't block deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

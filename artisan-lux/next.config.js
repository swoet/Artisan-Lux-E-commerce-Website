/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Output configuration for deployment
  output: 'standalone',
};

module.exports = nextConfig;

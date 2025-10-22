/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
  },
  webpack: (config) => {
    // Ignore locked webhook directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/src/app/api/webhooks/**'],
    };
    return config;
  },
};

export default nextConfig;

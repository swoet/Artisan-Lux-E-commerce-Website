import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  eslint: {
    // Prevent ESLint errors from failing production builds
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    // Avoid symlink resolution and disable persistent pack cache
    config.resolve = config.resolve || {};
    config.resolve.symlinks = false;
    // Disable webpack filesystem caching to prevent snapshot readlink attempts
    // @ts-ignore
    config.cache = false;
    // Reduce snapshotting interactions with the FS on Windows
    // @ts-ignore
    config.snapshot = config.snapshot || {};
    // @ts-ignore
    config.snapshot.managedPaths = [];
    // @ts-ignore
    config.snapshot.immutablePaths = [];
    return config;
  }
};

export default nextConfig;

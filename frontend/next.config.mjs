/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This fixes the "canvas" missing error for PDF libraries
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
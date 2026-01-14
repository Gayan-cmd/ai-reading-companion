/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  webpack: (config) => {
    // This tells webpack to ignore the 'canvas' module 
    // because it's not needed in the browser
    config.resolve.alias.canvas = false;
    
    return config;
  },

  reactCompiler: true,
};

export default nextConfig;

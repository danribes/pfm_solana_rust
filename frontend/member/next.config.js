/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure port to match Docker container
  port: 3002,
  // Allow importing from shared directory
  experimental: {
    externalDir: true,
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3002',
    NEXT_PUBLIC_CONTAINER_MODE: process.env.NEXT_PUBLIC_CONTAINER_MODE || 'false',
  },
  // Configure webpack for shared module support
  webpack: (config, { isServer }) => {
    // Add support for importing from shared directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': '/shared',
    };
    return config;
  },
};

module.exports = nextConfig; 
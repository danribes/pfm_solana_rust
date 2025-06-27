/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
  
  experimental: {
    externalDir: true,
  },
  
  webpack: (config, { isServer }) => {
    // Handle the shared directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': require('path').resolve(__dirname, '../shared'),
    };
    
    // Fix for Web3 and Node.js polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
      };
    }
    
    return config;
  },
  
  env: {
    NEXT_PUBLIC_CONTAINER_MODE: process.env.CONTAINER_MODE || 'false',
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SOLANA_RPC: process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
    NEXT_PUBLIC_SOLANA_WS: process.env.SOLANA_WS || 'wss://api.devnet.solana.com',
    NEXT_PUBLIC_NETWORK: process.env.NETWORK || 'devnet',
  },
  
  // Allow external imports from shared directory
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig; 
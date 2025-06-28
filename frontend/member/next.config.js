/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@solana/web3.js',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana-mobile/wallet-adapter-mobile',
    '@solana/wallet-standard',
    '@solana/wallet-standard-chains',
    '@solana/wallet-standard-core',
    '@solana/wallet-standard-features',
    '@solana/wallet-standard-util',
    '@solana/wallet-standard-wallet-adapter',
    '@solana/wallet-standard-wallet-adapter-react',
  ],
  
  experimental: {
    externalDir: true,
    esmExternals: 'loose',
  },
  
  webpack: (config, { isServer, webpack }) => {
    // Handle the shared directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': require('path').resolve(__dirname, '../shared'),
    };

    // Fix ES modules and import.meta issues
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle Solana wallet adapter modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
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
        buffer: require.resolve('buffer'),
      };

      // Add Buffer plugin using webpack parameter
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    return config;
  },
  
  env: {
    NEXT_PUBLIC_CONTAINER_MODE: process.env.CONTAINER_MODE || 'false',
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SOLANA_RPC: process.env.SOLANA_RPC || 'http://localhost:8899',
    NEXT_PUBLIC_SOLANA_WS: process.env.SOLANA_WS || 'ws://localhost:8900',
    NEXT_PUBLIC_NETWORK: process.env.NETWORK || 'localnet',
  },
};

module.exports = nextConfig; 
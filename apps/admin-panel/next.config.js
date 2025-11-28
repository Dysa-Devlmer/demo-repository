const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  output: 'standalone',
  // Disable static generation to avoid build errors
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-id';
  },

  // Enterprise Experimental Features
  experimental: {
    optimizeCss: true,
  },

  // Enterprise Environment Configuration
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8005',
    BUILD_NUMBER: process.env.BUILD_NUMBER || 'dev',
    GIT_COMMIT: process.env.GIT_COMMIT || 'local',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
  },

  // Enterprise Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8005'}/api/:path*`,
      },
    ];
  },

  // Enterprise Webpack Configuration
  webpack(config, { dev, isServer }) {
    // Enterprise Path Aliases
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    config.resolve.alias['@/utils'] = path.resolve(__dirname, 'src/utils');
    config.resolve.alias['@/types'] = path.resolve(__dirname, 'src/types');
    config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'src/hooks');
    config.resolve.alias['@/styles'] = path.resolve(__dirname, 'src/styles');

    // Enterprise Optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
          },
        },
      };
    }

    // Enterprise Bundle Analysis
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  // Enterprise Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Enterprise Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Enterprise Image Optimization
  images: {
    domains: [
      'localhost',
      'chatbotdysa.com',
      'staging.chatbotdysa.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },


  // Enterprise Compiler Configuration
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // Enterprise Performance Configuration
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Enterprise TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false, // TypeScript errors are now fixed
  },

  // Enterprise ESLint Configuration
  eslint: {
    ignoreDuringBuilds: true, // Changed for Docker build
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Enable linting in production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    domains: ['localhost', 'chatbotdysa.cl', 'api.chatbotdysa.cl'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.chatbotdysa.cl',
      },
    ],
  },
  async redirects() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001';
    return [
      {
        source: '/app',
        destination: appUrl,
        permanent: false,
      },
      {
        source: '/panel',
        destination: appUrl,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001',
    NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:7002',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
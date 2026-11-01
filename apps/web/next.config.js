/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@swap/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || process.env.API_URL;
    if (backendUrl) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl.replace(/\/+$/, '')}/api/v1/:path*`,
        },
        {
          source: '/health',
          destination: `${backendUrl.replace(/\/+$/, '')}/health`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;

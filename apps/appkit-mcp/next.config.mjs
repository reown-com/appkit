import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net'
      }
    ]
  },
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
  redirects: async () => [
    {
      source: '/see',
      destination: '/api/sse',
      permanent: true
    }
  ]
}

export default nextConfig

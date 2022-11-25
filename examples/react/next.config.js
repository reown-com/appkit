/** @type {import('next').NextConfig} */

// Only required within the scope of this monorepo
const nextConfig = {
  experimental: {
    transpilePackages: [
      '@web3modal/ethereum',
      '@web3modal/react',
      '@web3modal/ui',
      '@web3modal/core'
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig

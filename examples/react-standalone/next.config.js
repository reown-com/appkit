/** @type {import('next').NextConfig} */

// Only required within the scope of this monorepo
const nextConfig = {
  experimental: {
    transpilePackages: ['@web3modal/core', '@web3modal/ui']
  }
}

module.exports = nextConfig

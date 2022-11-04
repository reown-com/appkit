/** @type {import('next').NextConfig} */

// Only required within the scope of this monorepo
const nextConfig = {
  experimental: {
    transpilePackages: ['@web3modal/ethereum', '@web3modal/react']
  }
}

module.exports = nextConfig

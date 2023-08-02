/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: [
    '@web3modal/core',
    '@web3modal/ui',
    '@web3modal/scaffold-html',
    '@web3modal/wagmi',
    '@web3modal/wagmi/react'
  ]
}

module.exports = nextConfig

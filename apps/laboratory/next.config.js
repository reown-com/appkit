/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: [
    '@web3modal/core',
    '@web3modal/ui',
    '@web3modal/scaffold-html',
    '@web3modal/wagmi'
  ]
}

module.exports = nextConfig

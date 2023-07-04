/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: ['@web3modal/wagmi']
}

module.exports = nextConfig

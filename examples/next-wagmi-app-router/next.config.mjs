/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@reown/appkit',
    '@reown/appkit-adapter-wagmi',
    'wagmi',
    '@wagmi/core',
    '@wagmi/connectors'
  ],

  // Required in Next.js 16 when a `webpack` config is present (Turbopack is the default bundler).
  turbopack: {},

  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

export default nextConfig

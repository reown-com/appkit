/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  distDir: 'out',
  cleanDistDir: true,
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'content-type', value: 'application/json' }]
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'content-type', value: 'application/json' }]
      }
    ]
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
// Reference: https://docs.sentry.io/security-legal-pii/security/security-policy-reporting/#content-security-policy
const cspReportToHeader = {
  group: 'csp-endpoint',
  max_age: 10886400,
  endpoints: [
    {
      url: 'https://o1095249.ingest.sentry.io/api/4505685639364608/security/?sentry_key=36ff1e79c60877fce6c0273e94a8ed69'
    }
  ],
  include_subdomains: true
}

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  distDir: 'out',
  cleanDistDir: true,
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Report-To',
            value: JSON.stringify(cspReportToHeader)
          }
        ]
      },
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

export default nextConfig

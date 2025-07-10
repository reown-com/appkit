import { NextRequest, NextResponse } from 'next/server'

const verifyApiNestedIframesTestOuterDomain =
  'https://verify-api-nested-iframes-test-outer-domain.com'

const secureSiteDomain = process.env['NEXT_PUBLIC_SECURE_SITE_SDK_URL']
  ? new URL(process.env['NEXT_PUBLIC_SECURE_SITE_SDK_URL']).origin
  : ''

const isDevelopment = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'development'

const publicNodeDomains = [
  'https://ethereum-rpc.publicnode.com',
  'https://polygon-bor-rpc.publicnode.com',
  'https://arbitrum-rpc.publicnode.com',
  'https://optimism-rpc.publicnode.com',
  'https://gnosis-rpc.publicnode.com',
  'https://base-rpc.publicnode.com'
]
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDevelopment ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src * 'self' data: blob: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org https://tokens-data.1inch.io https://tokens.1inch.io https://ipfs.io https://cdn.zerion.io https://appkit-lab.reown.org;
    font-src 'self' https://fonts.gstatic.com;
    connect-src  'self' https://react-wallet.walletconnect.com https://rpc.walletconnect.com https://rpc.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.com https://api.web3modal.org wss://www.walletlink.org https://o1095249.ingest.sentry.io https://quote-api.jup.ag https://mempool.space ${publicNodeDomains.join(' ')};
    frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org https://secure.reown.com ${secureSiteDomain};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${verifyApiNestedIframesTestOuterDomain} https://app.safe.global;
    report-uri https://o1095249.ingest.sentry.io/api/4505685639364608/security/?sentry_key=36ff1e79c60877fce6c0273e94a8ed69;
    report-to csp-endpoint
`
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/gu, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  // Serve manifest.json through every sub-page
  if (request.nextUrl.pathname.endsWith('/manifest.json')) {
    const manifestResponse = NextResponse.json(
      {
        name: 'AppKit Laboratory',
        description: 'Laboratory application for AppKit to test and develop features',
        iconPath: '/logo.png',
        safeAppVersion: '1.0.0'
      },
      {
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    )

    return manifestResponse
  }

  return response
}

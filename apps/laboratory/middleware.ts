import { NextRequest, NextResponse } from 'next/server'

const verifyApiNestedIframesTestOuterDomain =
  'https://verify-api-nested-iframes-test-outer-domain.com'

const secureSiteDomain = process.env['NEXT_PUBLIC_SECURE_SITE_SDK_URL']
  ? new URL(process.env['NEXT_PUBLIC_SECURE_SITE_SDK_URL']).origin
  : ''

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src * 'self' data: blob: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org https://tokens-data.1inch.io https://tokens.1inch.io https://ipfs.io https://cdn.zerion.io https://appkit-lab.reown.org;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://react-wallet.walletconnect.com https://rpc.walletconnect.com https://rpc.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.com https://api.web3modal.org wss://www.walletlink.org https://o1095249.ingest.sentry.io https://quote-api.jup.ag https://mempool.space;
    frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org https://secure.reown.com https://widget.solflare.com/ ${secureSiteDomain};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${verifyApiNestedIframesTestOuterDomain};
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

  return response
}

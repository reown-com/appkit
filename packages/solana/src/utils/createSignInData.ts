import type { SolanaSignInInput } from '@solana/wallet-standard-features'

export const createSignInData = async (message: any): Promise<SolanaSignInInput> => {
  const now: Date = new Date()
  const uri = window.location.href
  const currentUrl = new URL(uri)
  const domain = currentUrl.host

  const currentDateTime = now.toISOString()
  const signInData: SolanaSignInInput = {
    domain,
    statement:
      'Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.',
    version: '1',
    nonce: 'oBbLoEldZs',
    chainId: 'solana:mainnet', // CAIP-222 format
    issuedAt: currentDateTime,
    resources: ['https://example.com', 'https://phantom.app/'],
    ...message
  }

  return signInData
}

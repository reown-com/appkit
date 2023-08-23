import type { SessionParams } from '../types'

export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
}

export const LOCAL_LABS_URL = 'http://localhost:3000/with-wagmi/react'
export const LOCAL_WALLET_URL = 'http://localhost:3001'
export const WALLET_URL = process.env.CI
  ? 'https://react-wallet.walletconnect.com/'
  : LOCAL_WALLET_URL

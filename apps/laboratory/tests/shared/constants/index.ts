import type { SessionParams } from '../types'

// Allow localhost
export const LOCAL_LABS_URL = 'http://localhost:3000/library/wagmi/'
export const WALLET_URL = 'https://react-wallet.walletconnect.com/'
export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
}

import type { SessionParams } from '../types'

// Allow localhost
export const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3000/'
export const WALLET_URL = process.env['WALLET_URL'] || 'https://react-wallet.walletconnect.com/'
export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
}

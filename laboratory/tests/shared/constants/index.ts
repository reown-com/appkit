import type { SessionParams } from '../types'

export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
}

// Will be moved to env vars in the future
export const LOCAL_LAB_URL = 'http://localhost:3000/with-wagmi/react'
export const LOCAL_WALLET_URL = 'http://localhost:3001'

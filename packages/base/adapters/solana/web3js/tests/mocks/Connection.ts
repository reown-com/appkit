import { Connection } from '@solana/web3.js'
import { vi } from 'vitest'

export function mockConnection() {
  const connection = new Connection('https://mocked.api.connection')

  return Object.assign(connection, {
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ',
      lastValidBlockHeight: 1
    })
  })
}

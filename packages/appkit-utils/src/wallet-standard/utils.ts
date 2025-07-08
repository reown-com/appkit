import type { Transaction, VersionedTransaction } from '@solana/web3.js'
import type { IdentifierString } from '@wallet-standard/base'

import type { SolanaChain } from './WalletConnectAccount.js'
import { SOLANA_CHAINS } from './constants.js'

/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain)
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
  return 'version' in transaction
}

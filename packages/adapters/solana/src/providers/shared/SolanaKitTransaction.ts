import { getTransactionDecoder, getTransactionEncoder } from '@solana/kit'

import type { AnySolanaKitTransaction } from '@reown/appkit-utils/solana'

export function isAnySolanaKitTransaction(value: unknown): value is AnySolanaKitTransaction {
  return typeof value === 'object' && value !== null && 'messageBytes' in value && 'signatures' in value
}

export function encodeSolanaKitTransaction(transaction: AnySolanaKitTransaction): Uint8Array {
  return new Uint8Array(getTransactionEncoder().encode(transaction))
}

export function decodeSolanaKitTransaction(bytes: Uint8Array): AnySolanaKitTransaction {
  return getTransactionDecoder().decode(bytes) as AnySolanaKitTransaction
}

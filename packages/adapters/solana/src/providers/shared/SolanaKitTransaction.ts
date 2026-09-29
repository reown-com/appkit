import {
  type Address,
  type SignatureBytes,
  getTransactionDecoder,
  getTransactionEncoder
} from '@solana/kit'

import type { AnySolanaKitTransaction } from '@reown/appkit-utils/solana'

export function isAnySolanaKitTransaction(value: unknown): value is AnySolanaKitTransaction {
  return (
    typeof value === 'object' && value !== null && 'messageBytes' in value && 'signatures' in value
  )
}

export function encodeSolanaKitTransaction(transaction: AnySolanaKitTransaction): Uint8Array {
  return new Uint8Array(getTransactionEncoder().encode(transaction))
}

export function decodeSolanaKitTransaction(bytes: Uint8Array): AnySolanaKitTransaction {
  return getTransactionDecoder().decode(bytes) as AnySolanaKitTransaction
}

export function addSolanaKitTransactionSignature<T extends AnySolanaKitTransaction>(
  transaction: T,
  signer: Address,
  signature: Uint8Array
): T {
  if (!(signer in transaction.signatures)) {
    throw new Error(`Cannot add signature: ${signer} is not a required signer of this transaction`)
  }

  if (signature.length !== 64) {
    throw new Error(`Invalid signature length: expected 64 bytes, received ${signature.length}`)
  }

  // Overwrite the existing key: `signatures` is an ordered map whose key order is the wire order
  return Object.freeze({
    ...transaction,
    signatures: Object.freeze({ ...transaction.signatures, [signer]: signature as SignatureBytes })
  })
}

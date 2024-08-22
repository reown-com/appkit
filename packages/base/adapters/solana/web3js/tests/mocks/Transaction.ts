import {
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js'
import { TestConstants } from '../util/TestConstants.js'

export function mockLegacyTransaction(): Transaction {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: TestConstants.accounts[0].publicKey,
      toPubkey: TestConstants.accounts[0].publicKey,
      lamports: 10_000_000
    })
  )
  transaction.feePayer = TestConstants.accounts[0].publicKey
  transaction.recentBlockhash = 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ'

  return transaction
}

export function mockVersionedTransaction(): VersionedTransaction {
  const messageV0 = new TransactionMessage({
    payerKey: TestConstants.accounts[0].publicKey,
    recentBlockhash: 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ',
    instructions: [
      SystemProgram.transfer({
        fromPubkey: TestConstants.accounts[0].publicKey,
        toPubkey: TestConstants.accounts[0].publicKey,
        lamports: 10_000_000
      })
    ]
  }).compileToV0Message()

  return new VersionedTransaction(messageV0)
}

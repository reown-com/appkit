import { fromLegacyPublicKey, fromLegacyTransactionInstruction } from '@solana/compat'
import {
  type Blockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash
} from '@solana/kit'
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

export function mockSolanaKitTransaction() {
  const message = appendTransactionMessageInstructions(
    [
      fromLegacyTransactionInstruction(
        SystemProgram.transfer({
          fromPubkey: TestConstants.accounts[0].publicKey,
          toPubkey: TestConstants.accounts[0].publicKey,
          lamports: 10_000_000
        })
      )
    ],
    setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash: 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ' as Blockhash,
        lastValidBlockHeight: 0n
      },
      setTransactionMessageFeePayer(
        fromLegacyPublicKey(TestConstants.accounts[0].publicKey),
        createTransactionMessage({ version: 0 })
      )
    )
  )

  return compileTransaction(message)
}

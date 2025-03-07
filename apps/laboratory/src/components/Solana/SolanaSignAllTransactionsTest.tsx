import { useState } from 'react'

import { Button, Spacer, Stack } from '@chakra-ui/react'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js'
import bs58 from 'bs58'

import { type Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

const PHANTOM_DEVNET_ADDRESS = '8vCyX7oB6Pc3pbWMGYYZF5pbSnAdQ7Gyr32JqxqCy8ZR'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS)
const amountInLamports = 1_000_000

export function SolanaSignAllTransactionsTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const [loading, setLoading] = useState(false)

  async function onSignTransaction(type: 'legacy' | 'versioned') {
    try {
      setLoading(true)
      if (!walletProvider?.publicKey) {
        throw Error('user is disconnected')
      }

      if (!connection) {
        throw Error('no connection set')
      }

      const transactions = await Promise.all(
        Array.from({ length: 5 }, () => createTransaction(walletProvider, connection, type))
      )
      const response = await walletProvider.signAllTransactions(transactions)

      const description = response
        .map(transaction => {
          const signature =
            transaction.signatures[0] instanceof Uint8Array
              ? transaction.signatures[0]
              : transaction.signatures[0]?.signature

          if (!signature) {
            throw Error('Empty signature')
          }

          return bs58.encode(signature)
        })
        .join('\n\n')

      toast({
        title: 'Success',
        description,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
        onClick={onSignTransaction.bind(null, 'legacy')}
        isDisabled={loading}
      >
        Sign All Transactions
      </Button>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSignTransaction.bind(null, 'versioned')}
        isDisabled={loading}
      >
        Sign All Versioned Transactions
      </Button>
      <Spacer />
    </Stack>
  )
}

async function createTransaction(
  provider: Provider,
  connection: Connection,
  type: 'legacy' | 'versioned'
) {
  if (!provider.publicKey) {
    throw Error('No public key found')
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const instructions = [
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: recipientAddress,
      lamports: amountInLamports
    })
  ]

  if (type === 'legacy') {
    return new Transaction({ feePayer: provider.publicKey, blockhash, lastValidBlockHeight }).add(
      ...instructions
    )
  }

  return new VersionedTransaction(
    new TransactionMessage({
      payerKey: provider.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message()
  )
}

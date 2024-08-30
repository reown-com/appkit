import { useState } from 'react'
import { Button, Stack, Text, Spacer } from '@chakra-ui/react'
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram
} from '@solana/web3.js'

import { useWeb3ModalAccount, useWeb3ModalProvider, type Provider } from '@web3modal/solana/react'

import { solana } from '../../utils/ChainsUtil'
import { useChakraToast } from '../Toast'
import type { Connection } from '@web3modal/base/adapters/solana/web3js'
import bs58 from 'bs58'

const PHANTOM_DEVNET_ADDRESS = '8vCyX7oB6Pc3pbWMGYYZF5pbSnAdQ7Gyr32JqxqCy8ZR'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS)
const amountInLamports = 1_000_000

export function SolanaSignAllTransactionsTest() {
  const toast = useChakraToast()
  const { chainId } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
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
        .map(transaction => bs58.encode(transaction.signatures[0] as Buffer))
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

  if (chainId === solana.chainId) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to Solana Devnet or Testnet to test this feature
      </Text>
    )
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

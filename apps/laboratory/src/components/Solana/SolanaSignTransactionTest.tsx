import { useState } from 'react'

import { Button, Spacer, Stack } from '@chakra-ui/react'
import {
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
const amountInLamports = 10_000_000

export function SolanaSignTransactionTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const [isLoading, setIsLoading] = useState(false)

  async function onSignTransaction() {
    try {
      setIsLoading(true)
      if (!walletProvider?.publicKey) {
        throw Error('user is disconnected')
      }

      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletProvider.publicKey,
          toPubkey: recipientAddress,
          lamports: amountInLamports
        })
      )
      transaction.feePayer = walletProvider.publicKey

      if (!connection) {
        throw Error('no connection set')
      }
      const { blockhash } = await connection.getLatestBlockhash()

      transaction.recentBlockhash = blockhash

      const signedTransaction = await walletProvider.signTransaction(transaction)
      const signature = signedTransaction.signatures[0]?.signature

      if (!signature) {
        throw Error('Empty signature')
      }

      toast({
        title: 'Success',
        description: bs58.encode(signature),
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSignVersionedTransaction() {
    try {
      setIsLoading(true)
      if (!walletProvider?.publicKey) {
        throw Error('user is disconnected')
      }

      if (!connection) {
        throw Error('no connection set')
      }
      const { blockhash } = await connection.getLatestBlockhash()
      const instructions = [
        SystemProgram.transfer({
          fromPubkey: walletProvider.publicKey,
          toPubkey: recipientAddress,
          lamports: amountInLamports
        })
      ]

      // Create v0 compatible message
      const messageV0 = new TransactionMessage({
        payerKey: walletProvider.publicKey,
        recentBlockhash: blockhash,
        instructions
      }).compileToV0Message()

      // Make a versioned transaction
      const transactionV0 = new VersionedTransaction(messageV0)

      const signedTransaction = await walletProvider.signTransaction(transactionV0)
      const signature = signedTransaction.signatures[0]

      if (!signature) {
        throw Error('Empty signature')
      }

      toast({
        title: 'Success',
        description: bs58.encode(signature),
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
        onClick={onSignTransaction}
        isDisabled={isLoading}
      >
        Sign Transaction
      </Button>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSignVersionedTransaction}
        isDisabled={isLoading}
      >
        Sign Versioned Transaction
      </Button>
      <Spacer />
    </Stack>
  )
}

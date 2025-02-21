import { useState } from 'react'

import { Button, Link, Spacer, Stack } from '@chakra-ui/react'
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js'

import { type Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ErrorUtil } from '@/src/utils/ErrorUtil'

const PHANTOM_TESTNET_ADDRESS = '8vCyX7oB6Pc3pbWMGYYZF5pbSnAdQ7Gyr32JqxqCy8ZR'
const recipientAddress = new PublicKey(PHANTOM_TESTNET_ADDRESS)
const amountInLamports = 10_000_000

export function SolanaSendTransactionTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const [loading, setLoading] = useState(false)

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider?.publicKey || !address) {
        throw Error('user is disconnected')
      }

      if (!connection) {
        throw Error('no connection set')
      }

      const balance = await connection.getBalance(walletProvider.publicKey)
      if (balance < amountInLamports) {
        throw Error('Not enough SOL in wallet')
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

      const { blockhash } = await connection.getLatestBlockhash()

      transaction.recentBlockhash = blockhash

      const signature = await walletProvider.sendTransaction(transaction, connection)

      toast({
        title: 'Success',
        description: signature,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Transaction Error',
        description: ErrorUtil.getErrorMessage(err),
        type: 'error',
        partialDescription: false
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSendVersionedTransaction() {
    try {
      setLoading(true)
      if (!walletProvider?.publicKey || !address) {
        throw Error('user is disconnected')
      }

      if (!connection) {
        throw Error('no connection set')
      }

      const balance = await connection.getBalance(walletProvider.publicKey)
      if (balance < amountInLamports) {
        throw Error('Not enough SOL in wallet')
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

      const signature = await walletProvider.sendTransaction(transactionV0, connection)

      toast({
        title: 'Success',
        description: signature,
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

  if (!address) {
    return null
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
        onClick={onSendTransaction}
        isDisabled={loading}
      >
        Sign and Send Transaction
      </Button>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendVersionedTransaction}
        isDisabled={loading}
      >
        Sign and Send Versioned Transaction
      </Button>
      <Spacer />

      <Link isExternal href="https://solfaucet.com/">
        <Button variant="outline" colorScheme="blue">
          Solana Faucet
        </Button>
      </Link>
    </Stack>
  )
}

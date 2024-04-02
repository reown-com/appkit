import { useState } from 'react'
import { Stack, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'
import { toast } from 'sonner'
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  Connection
} from '@solana/web3.js'

import { solana } from '../../utils/ChainsUtil'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const PHANTOM_TESTNET_ADDRESS = 'EmT8r4E8ZjoQgt8sXGbaWBRMKfUXsVT1wonoSnJZ4nBn'
const recipientAddress = new PublicKey(PHANTOM_TESTNET_ADDRESS)
const amountInLamports = 100000000

export function SolanaSendTransactionTest() {
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
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

      const signature = await walletProvider.sendTransaction(transaction, connection as Connection)
      toast.success('Success', { description: signature })
    } catch (err) {
      toast.error('Success', {
        description: (err as Error).message
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSendVersionedTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
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

      const signature = await walletProvider.sendTransaction(
        transactionV0,
        connection as Connection
      )
      toast.success('Success', { description: signature })
    } catch (err) {
      toast.error('Error', {
        description: (err as Error).message
      })
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return null
  }

  if (chainId === solana.chainId) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to Solana Devnet or Testnet to test this feature
      </Text>
    )
  }

  const supportV0Transactions = walletProvider?.name !== 'WalletConnect'

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={loading}
        variant={'secondary'}
      >
        Sign and Send Transaction
      </Button>

      {supportV0Transactions ? (
        <Button
          data-test-id="sign-transaction-button"
          onClick={onSendVersionedTransaction}
          disabled={loading}
        >
          Sign and Send Versioned Transaction
        </Button>
      ) : null}
      <Spacer />

      <Link
        className={cn(buttonVariants({ variant: 'outline' }))}
        target="_blank"
        href="https://solfaucet.com/"
      >
        Solana Faucet
      </Link>
    </Stack>
  )
}

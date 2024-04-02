import { useState } from 'react'
import { Stack, Text, Spacer } from '@chakra-ui/react'
import { toast } from 'sonner'
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram
} from '@solana/web3.js'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { solana } from '../../utils/ChainsUtil'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const PHANTOM_DEVNET_ADDRESS = 'EmT8r4E8ZjoQgt8sXGbaWBRMKfUXsVT1wonoSnJZ4nBn'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS)
const amountInLamports = 100000000

export function SolanaSignTransactionTest() {
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onSignTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
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
      const tx = await walletProvider.signTransaction(transaction)
      const signature = tx.signatures[0]?.signature

      toast.success('Success', { description: signature })
    } catch (err) {
      toast.success('Error', {
        description: 'Failed to sign transaction'
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSignVersionedTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
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

      const tx = await walletProvider.signTransaction(transactionV0)
      const signature = tx.signatures[0]?.signature

      toast.success('Success', { description: signature })
    } catch (err) {
      toast.success('Error', {
        description: 'Failed to sign transaction'
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
        onClick={onSignTransaction}
        disabled={loading}
        variant="secondary"
      >
        Sign Transaction
      </Button>
      {supportV0Transactions ? (
        <Button
          data-test-id="sign-transaction-button"
          onClick={onSignVersionedTransaction}
          disabled={loading}
          variant="secondary"
        >
          Sign Versioned Transaction
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

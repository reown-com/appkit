import { useState } from 'react'
import { Button, Stack, Text, Spacer, Link } from '@chakra-ui/react'
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram
} from '@solana/web3.js'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { solana } from '../../utils/ChainsUtil'
import { useChakraToast } from '../Toast'

const PHANTOM_DEVNET_ADDRESS = '8vCyX7oB6Pc3pbWMGYYZF5pbSnAdQ7Gyr32JqxqCy8ZR'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS)
const amountInLamports = 100000000

export function SolanaSignTransactionTest() {
  const toast = useChakraToast()
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

      toast({
        title: 'Success',
        description: signature,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        type: 'error'
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

      toast({
        title: 'Success',
        description: signature,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        type: 'error'
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
        isDisabled={loading}
      >
        Sign Transaction
      </Button>
      {supportV0Transactions ? (
        <Button
          data-test-id="sign-transaction-button"
          onClick={onSignVersionedTransaction}
          isDisabled={loading}
        >
          Sign Versioned Transaction
        </Button>
      ) : null}
      <Spacer />

      <Link isExternal href="https://solfaucet.com/">
        <Button variant="outline" colorScheme="blue">
          Solana Faucet
        </Button>
      </Link>
    </Stack>
  )
}

import { useState } from 'react'
import { Button, useToast, Stack, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'
import { PublicKey, Transaction, TransactionMessage, VersionedTransaction, SystemProgram } from '@solana/web3.js';

import { solanaDevnet } from '../../utils/ChainsUtil'

const PHANTOM_TESTNET_ADDRESS = '8vCyX7oB6Pc3pbWMGYYZF5pbSnAdQ7Gyr32JqxqCy8ZR'
const recipientAddress = new PublicKey(PHANTOM_TESTNET_ADDRESS);
const amountInLamports = 100000000;

export function SolanaSendTransactionTest() {
  const toast = useToast()
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
        throw ('no connection set')
      }

      // Create a new transaction
      let transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletProvider.publicKey,
          toPubkey: recipientAddress,
          lamports: amountInLamports,
        })
      );
      transaction.feePayer = walletProvider.publicKey;

      const { blockhash } = await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;

      const signature = await walletProvider.sendTransaction(transaction, connection)
      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
    } catch (err) {
      console.log(`err`, err);
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        status: 'error',
        isClosable: true
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
        throw ('no connection set')
      }
      const { blockhash } = await connection.getLatestBlockhash();

      const instructions = [
        SystemProgram.transfer({
          fromPubkey: walletProvider.publicKey,
          toPubkey: recipientAddress,
          lamports: amountInLamports,
        }),
      ];

      // create v0 compatible message
      const messageV0 = new TransactionMessage({
        payerKey: walletProvider.publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      // make a versioned transaction
      const transactionV0 = new VersionedTransaction(messageV0);

      const signature = await walletProvider.sendTransaction(transactionV0, connection)
      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
    } catch (err) {
      console.log(`err`, err);
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        status: 'error',
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }
  return chainId === solanaDevnet.chainId && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        isDisabled={loading}
      >
        Sign and Send Transaction
      </Button>

      <Spacer />

      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendVersionedTransaction}
        isDisabled={loading}
      >
        Sign and Send Versioned Transaction
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Solana Devnet to test this feature
    </Text>
  )
}

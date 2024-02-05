import { useState } from 'react'
import { Button, useToast, Stack, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'
import { Connection, PublicKey, Transaction, TransactionMessage, VersionedTransaction, SystemProgram } from '@solana/web3.js';

import { solanaDevnet } from '../../utils/ChainsUtil'


const WALLECT_CONNECT_DEVNET_ADDRESS = '2yr4zgYEyWRqFrNym31X1oJ4NprJsXjATEQb5XnkFY8v'
const PHANTOM_DEVNET_ADDRESS = 'EmT8r4E8ZjoQgt8sXGbaWBRMKfUXsVT1wonoSnJZ4nBn'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS);
const amountInLamports = 100000000;

export function SolanaSignTransactionTest() {
  const toast = useToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onSignTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      let signature;
      if (walletProvider.id === "WalletConnect") {
        signature = await walletProvider.signTransaction('transfer',
          {
            to: WALLECT_CONNECT_DEVNET_ADDRESS,
            amountInLamports: 100000000,
            feePayer: 'from'
          })
      } else {
        const connection = new Connection("https://api.devnet.solana.com", 'finalized');

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
        const tx = await walletProvider.signTransaction(transaction)
        signature = tx.signatures[0].signature
      }

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

  async function onSignVersionedTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      let signature;
      if (walletProvider.id === "WalletConnect") {
        signature = await walletProvider.signVersionedTransaction({
          to: WALLECT_CONNECT_DEVNET_ADDRESS,
          amountInLamports: 100000000,
          feePayer: 'from'
        })
      } else {
        const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

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

        const tx = await walletProvider.signTransaction(transactionV0)
        signature = tx.signatures[0]
      }

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
    <Stack direction={['column', 'column', 'row']} >
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSignTransaction}
        isDisabled={loading}
      >
        Sign Transaction
      </Button>
      <Spacer />
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSignVersionedTransaction}
        isDisabled={loading}
      >
        Sign Versioned Transaction
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Solana Devnet to test this feature
    </Text>
  )
}

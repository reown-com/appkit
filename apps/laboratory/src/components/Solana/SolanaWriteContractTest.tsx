import React from 'react'
import { Button, useToast } from '@chakra-ui/react'
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  type Signer
} from '@solana/web3.js'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

// Hypothetical Program ID for the counter program; replace with your actual program ID
export const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
export const COUNTER_ACCOUNT_SIZE = 8

export function SolanaWriteContractTest() {
  // const connection = new Connection(
  //   'https://rpc.walletconnect.com/v1?chainId=solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp&projectId=c6f78092df3710d5a3008ed92eb8b170'
  // )

  const toast = useToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()

  connection?.sendRawTransaction

  async function onIncrementCounter() {
    try {
      if (!walletProvider || !address) {
        throw new Error('User is disconnected')
      }

      if (!connection) {
        throw new Error('No connection set')
      }

      // TODO: implement program instruction calling
    } catch (err) {
      console.error(err)
      toast({
        title: 'Transaction failed',
        description: 'Failed to increment counter',
        status: 'error',
        isClosable: true
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onIncrementCounter}>
      Increment Counter
    </Button>
  )
}

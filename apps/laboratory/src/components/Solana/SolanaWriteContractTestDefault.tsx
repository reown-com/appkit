import React from 'react'
import { Button, useToast } from '@chakra-ui/react'
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import type { Connection, Signer, LAMPORTS_PER_SOL } from '@solana/web3.js'

/*
 * Hypothetical Program ID for the counter program; replace with your actual program ID
 * export const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
 * export const PROGRAM_ID = new PublicKey('p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98')
 */
export const PROGRAM_ID = new PublicKey('GobzzzFQsFAHPvmwT42rLockfUCeV3iutEkK218BxT8K')
// Export const PROGRAM_ID = new PublicKey('11111111111111111111111111111111')
export const COUNTER_ACCOUNT_SIZE = 8

const PHANTOM_DEVNET_ADDRESS = '7qPFiUY5wEUceShpXSSYcMzUWHpjqXwFJ3GBdCP4eWQE'
const recipientAddress = new PublicKey(PHANTOM_DEVNET_ADDRESS)
const amountInLamports = 100000000

export function SolanaWriteContractTest() {
  /*
   * Const connection = new Connection(
   *   'https://rpc.walletconnect.com/v1?chainId=solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp&projectId=c6f78092df3710d5a3008ed92eb8b170'
   * )
   */

  const toast = useToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()

  const counterKeypair = Keypair.generate()
  const counter = counterKeypair.publicKey

  async function onIncrementCounter() {
    try {
      if (!walletProvider || !address) {
        throw new Error('User is disconnected')
      }

      if (!connection) {
        throw new Error('No connection set')
      }

      const balance = await connection.getBalance(walletProvider.publicKey)
      if (balance < amountInLamports) {
        throw Error('Not enough SOL in wallet')
      }

      // Create a TransactionInstruction to interact with our counter program
      const allocIx: TransactionInstruction = SystemProgram.createAccount({
        fromPubkey: walletProvider.publicKey,
        newAccountPubkey: counter,
        lamports: await connection.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SIZE),
        space: COUNTER_ACCOUNT_SIZE,
        programId: PROGRAM_ID
      })

      const incrementIx: TransactionInstruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          {
            pubkey: counter,
            isSigner: false,
            isWritable: true
          }
        ],
        data: Buffer.from([0x0])
      })

      ///createIncrementInstruction({ counter }, {});
      const tx = new Transaction().add(allocIx).add(incrementIx)

      // Explicitly set the feePayer to be our wallet (this is set to first signer by default)
      tx.feePayer = walletProvider.publicKey

      // Fetch a "timestamp" so validators know this is a recent transaction
      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash

      /*
       * Send transaction to network (local network)
       * await sendAndConfirmTransaction(connection, tx, [payerKeypair, counterKeypair], {
       *   skipPreflight: true,
       *   commitment: 'confirmed'
       * })
       */
      const responseTransaction = await walletProvider.sendAndConfirmTransaction(
        tx,
        [counterKeypair],
        {
          skipPreflight: true,
          commitment: 'confirmed'
        }
      )

      console.log('responseTransaction', responseTransaction)

      /*
       * Create a new transaction
       * const transaction = new Transaction().add(
       *   SystemProgram.transfer({
       *     fromPubkey: walletProvider.publicKey,
       *     toPubkey: recipientAddress,
       *     lamports: amountInLamports
       *   })
       * )
       */

      /*
       * Const allocIx: TransactionInstruction = SystemProgram.createAccount({
       *   fromPubkey: walletProvider.publicKey,
       *   newAccountPubkey: counter,
       *   lamports: await connection.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SIZE),
       *   space: COUNTER_ACCOUNT_SIZE,
       *   programId: PROGRAM_ID
       * })
       *
       * transaction.feePayer = walletProvider.publicKey
       */

      // Const { blockhash } = await connection.getLatestBlockhash()

      // Transaction.recentBlockhash = blockhash

      // Console.log('test counter:', transaction)

      /*
       * TODO: implement program instruction calling
       * const tx = await walletProvider.signSendAndConfirmTransaction(transaction, [counterKeypair])
       *
       * console.log('after counter:', transaction, tx)
       */

      toast({ title: 'Succcess', description: tx.signature, status: 'success', isClosable: true })
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

import React from 'react'
import { Button, useToast } from '@chakra-ui/react'
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Connection as SolanaConnection
} from '@solana/web3.js'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'
import { solanaLocalNet } from '../../utils/ChainsUtil'
import { SolanaConstantsUtil } from '../../utils/SolanaConstants'

export const COUNTER_ACCOUNT_SIZE = 8

function deserializeCounterAccount(data?: Buffer): any {
  if (data?.byteLength !== 8) {
    throw Error('Need exactly 8 bytes to deserialize counter')
  }

  return {
    count: Number(data[0])
  }
}

export function SolanaWriteContractTestWithoutSign() {
  const toast = useToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
  const PROGRAM_ID = new PublicKey(SolanaConstantsUtil.programIds.localNet)

  async function onIncrementCounter() {
    try {
      if (!walletProvider || !address) {
        throw new Error('User is disconnected')
      }

      if (!connection) {
        throw new Error('No connection set')
      }

      const airdropConnection = new SolanaConnection(solanaLocalNet.rpcUrl, 'confirmed')

      const counterKeypair = Keypair.generate()
      const counter = counterKeypair.publicKey

      // Randomly generate our payer wallet
      const payerKeypair = Keypair.generate()
      const payer = payerKeypair.publicKey

      const signature = await airdropConnection.requestAirdrop(payer, LAMPORTS_PER_SOL)

      const latestBlockHash = await connection.getLatestBlockhash()
      await airdropConnection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      })

      const balance = await connection.getBalance(payer)

      if (balance < LAMPORTS_PER_SOL / 100) {
        throw Error('Not enough SOL in wallet')
      }

      const allocIx: TransactionInstruction = SystemProgram.createAccount({
        fromPubkey: payer,
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

      const tx = new Transaction().add(allocIx).add(incrementIx)

      tx.feePayer = payer
      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash

      // Send transaction to network
      await sendAndConfirmTransaction(connection, tx, [payerKeypair, counterKeypair])

      const counterAccountInfo = await connection.getAccountInfo(counter, {
        commitment: 'confirmed'
      })

      if (!counterAccountInfo) {
        throw new Error('Expected counter account to have been created')
      }

      const counterAccount = deserializeCounterAccount(counterAccountInfo?.data)

      if (counterAccount.count !== 1) {
        throw new Error('Expected count to have been 1')
      }

      toast({
        title: 'Succcess',
        description: `[alloc+increment] count is: ${counterAccount.count}`,
        status: 'success',
        isClosable: true
      })
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
      Increment Counter Without Sign
    </Button>
  )
}

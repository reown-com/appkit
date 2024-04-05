import React, { useState } from 'react'
import { Box, Button, useToast } from '@chakra-ui/react'
import {
  Connection,
  SystemProgram,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js'
import { SolanaConstantsUtil } from '../../utils/SolanaConstants'
import { solanaLocalNet } from '../../utils/ChainsUtil'

export const COUNTER_ACCOUNT_SIZE = 8

function deserializeCounterAccount(data?: Buffer): any {
  if (data?.byteLength !== 8) {
    throw Error('Need exactly 8 bytes to deserialize counter')
  }

  return {
    count: Number(data[0])
  }
}

export function SolanaWriteContractTest() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function onIncrementCounter() {
    setLoading(true)

    const PROGRAM_ID = new PublicKey(SolanaConstantsUtil.programIds.localNet)

    try {
      // Use your localhost rpc connection
      const connection = new Connection(solanaLocalNet.rpcUrl, 'confirmed')

      if (!connection) {
        throw new Error('No connection set')
      }

      // Randomly generate our account wallet
      const counterKeypair = Keypair.generate()
      const counter = counterKeypair.publicKey

      // Randomly generate our payer wallet
      const payerKeypair = Keypair.generate()
      const payer = payerKeypair.publicKey

      const signature = await connection.requestAirdrop(payer, LAMPORTS_PER_SOL)

      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      })

      console.log('balance', await connection.getBalance(payer))

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

      // Explicitly set the feePayer to be our wallet (this is set to first signer by default)
      tx.feePayer = payer

      // Send transaction to network (local network)
      await sendAndConfirmTransaction(connection, tx, [payerKeypair, counterKeypair])

      // Get the counter account info from network
      const counterAccountInfo = await connection.getAccountInfo(counter, {
        commitment: 'confirmed'
      })

      if (!counterAccountInfo) {
        throw new Error('Expected counter account to have been created')
      }

      // Deserialize the counter & check count has been incremented
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
      toast({
        title: 'Transaction failed',
        description: 'Failed to increment counter',
        status: 'error',
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Button isDisabled={loading} data-testid="sign-message-button" onClick={onIncrementCounter}>
        Increment Counter Without WC Connection
      </Button>
    </Box>
  )
}

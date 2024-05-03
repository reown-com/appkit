import React, { useState } from 'react'
import { Button } from '@chakra-ui/react'
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { COUNTER_ACCOUNT_SIZE } from '../../utils/SolanaConstants'
import { deserializeCounterAccount, detectProgramId } from '../../utils/SolanaUtil'
import { useChakraToast } from '../Toast'

export function SolanaWriteContractTest() {
  const toast = useChakraToast()
  const { address, currentChain } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onIncrementCounter() {
    setLoading(true)

    const PROGRAM_ID = new PublicKey(detectProgramId(currentChain?.chainId ?? ''))

    try {
      if (!walletProvider || !address) {
        throw new Error('User is disconnected')
      }

      if (!connection) {
        throw new Error('No connection set')
      }

      const counterKeypair = Keypair.generate()
      const counter = counterKeypair.publicKey

      const balance = await connection.getBalance(walletProvider.publicKey)
      if (balance < LAMPORTS_PER_SOL / 100) {
        throw Error('Not enough SOL in wallet')
      }

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

      const tx = new Transaction().add(allocIx).add(incrementIx)

      tx.feePayer = walletProvider.publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash

      await walletProvider.signAndSendTransaction(tx, [counterKeypair])

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
        title: 'Success',
        description: `[alloc+increment] count is: ${counterAccount.count}`,
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

  return (
    <Button
      isDisabled={loading}
      data-testid="increment-counter-with-sign-button"
      onClick={onIncrementCounter}
    >
      Increment Counter With Sign
    </Button>
  )
}

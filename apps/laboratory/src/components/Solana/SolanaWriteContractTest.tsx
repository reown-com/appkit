import React, { useState } from 'react'

import { Button } from '@chakra-ui/react'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js'

import { type Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { COUNTER_ACCOUNT_SIZE } from '@/src/utils/SolanaConstants'
import { deserializeCounterAccount, detectProgramId } from '@/src/utils/SolanaUtil'

export function SolanaWriteContractTest() {
  const toast = useChakraToast()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const [loading, setLoading] = useState(false)

  async function onIncrementCounter() {
    setLoading(true)

    const PROGRAM_ID = new PublicKey(detectProgramId(caipNetwork?.id?.toString() ?? ''))

    try {
      if (!walletProvider?.publicKey) {
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

      const allocIx = SystemProgram.createAccount({
        fromPubkey: walletProvider.publicKey,
        newAccountPubkey: counter,
        lamports: await connection.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SIZE),
        space: COUNTER_ACCOUNT_SIZE,
        programId: PROGRAM_ID
      })

      const incrementIx = new TransactionInstruction({
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

      const latestBlockhash = await connection.getLatestBlockhash()

      const transaction = new VersionedTransaction(
        new TransactionMessage({
          payerKey: walletProvider.publicKey,
          instructions: [allocIx, incrementIx],
          recentBlockhash: latestBlockhash.blockhash
        }).compileToV0Message()
      )

      transaction.sign([counterKeypair])

      const transactionId = await walletProvider.sendTransaction(transaction, connection, {
        preflightCommitment: 'confirmed'
      })

      // We should consider using `connection.confirmTransaction` instead of polling when websocket support is added
      await new Promise<void>(resolve => {
        const interval = setInterval(async () => {
          const status = await connection.getSignatureStatus(transactionId)

          if (status?.value) {
            clearInterval(interval)
            resolve()
          }
        }, 1000)
      })

      const counterAccountInfo = await connection.getAccountInfo(counter, {
        commitment: 'confirmed'
      })

      if (!counterAccountInfo) {
        throw new Error('Expected counter account to have been created')
      }

      const counterAccount = deserializeCounterAccount(counterAccountInfo.data)

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

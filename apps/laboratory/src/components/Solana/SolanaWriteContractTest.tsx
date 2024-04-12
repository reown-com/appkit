import React, { useState } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'
import { solanaLocalNet } from '../../utils/ChainsUtil'
import { COUNTER_ACCOUNT_SIZE } from '../../utils/SolanaConstants'
import { deserializeCounterAccount, detectProgramId } from '../../utils/SolanaUtil'

export function SolanaWriteContractTest() {
  const toast = useToast()
  const { address, currentChain } = useWeb3ModalAccount()
  const { walletProvider, connection } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onIncrementCounter() {
    setLoading(true)

    const PROGRAM_ID = new PublicKey(detectProgramId(currentChain.chainId))
    /* Add your program id */

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
        const airdropConnection = new Connection(solanaLocalNet.rpcUrl)
        const signature = await airdropConnection.requestAirdrop(
          walletProvider.publicKey,
          LAMPORTS_PER_SOL
        )

        const latestBlockHash = await connection.getLatestBlockhash()
        await airdropConnection.confirmTransaction({
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature
        })
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button isDisabled={loading} data-testid="sign-message-button" onClick={onIncrementCounter}>
      Increment Counter With Sign
    </Button>
  )
}
